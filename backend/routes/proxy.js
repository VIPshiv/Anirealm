const express = require('express');
const router = express.Router();

const SUWA_BASE = "http://127.0.0.1:4567"; 

// --- Helper Functions ---

// Simple in-memory cache
const cache = new Map();
function setCache(key, val, ttlSec=60) {
  cache.set(key, { val, expires: Date.now() + ttlSec*1000 });
}
function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.val;
}

// Helper to call Suwayomi
async function callUpstream(url, opts={}) {
  try {
    const r = await fetch(url, opts);
    const ct = r.headers.get("content-type") || "";
    const text = await r.text();
    let json = null;
    try { if (ct.includes("application/json")) json = JSON.parse(text); } catch(e){}
    
    // If 500 or other error, return details but don't throw
    if (!r.ok) return { ok: false, status: r.status, json, text };
    return { ok: true, status: r.status, json, text };
  } catch (err) {
    console.error("Upstream call error:", err);
    return { ok: false, status: 0, err, text: String(err) };
  }
}

// @route   GET api/search
// @desc    Global Search Proxy (Suwayomi)
// @access  Public
router.get("/", async (req, res) => {
  const q = (req.query.q || "").trim();
  const sourceIdsParam = req.query.sources || "";
  
  if (!q) return res.status(400).json({ error: "missing q param" });

  const cacheKey = `search:${q}:${sourceIdsParam}`;
  const cached = getCache(cacheKey);
  if (cached) return res.json({ fromCache: true, results: cached });

  let targetSourceIds = [];

  // 1. Determine which sources to search
  if (sourceIdsParam) {
    targetSourceIds = sourceIdsParam.split(',');
  } else {
    // If no specific sources requested, fetch all from Suwayomi
    const sourcesUrl = `${SUWA_BASE}/api/v1/source/list`;
    const srcResp = await callUpstream(sourcesUrl);
    if (!srcResp.ok) {
      return res.status(502).json({ error: "failed to list sources", upstream: srcResp });
    }
    // Filter out invalid sources if needed
    targetSourceIds = (srcResp.json || []).map(s => s.id);
  }

  // 2. Search sequentially (or with concurrency)
  // We'll use a concurrency of 5 to speed things up but not overwhelm
  const concurrency = 5;
  const results = [];
  const errors = [];
  let idx = 0;

  async function worker() {
    while (idx < targetSourceIds.length) {
      const sourceId = targetSourceIds[idx++];
      if (!sourceId) continue;

      // Construct Suwayomi search URL
      // Note: Suwayomi uses /api/v1/source/{id}/search?query={q}&page=1
      const url = `${SUWA_BASE}/api/v1/source/${encodeURIComponent(sourceId)}/search?query=${encodeURIComponent(q)}&page=1`;
      
      // console.log(`[Proxy] Searching source ${sourceId}...`);
      const r = await callUpstream(url);

      // Suwayomi returns { mangaList: [...] } or just [...] depending on version/endpoint
      // We need to handle both cases
      let items = [];
      if (r.ok) {
        if (Array.isArray(r.json)) {
          items = r.json;
        } else if (r.json && Array.isArray(r.json.mangaList)) {
          items = r.json.mangaList;
        } else if (r.json && Array.isArray(r.json.results)) {
          items = r.json.results;
        } else if (r.json && Array.isArray(r.json.data)) {
           items = r.json.data;
        }
      }

      if (r.ok && items.length >= 0) { // Allow empty results as "success"
        // Attach source ID to results so frontend knows where they came from
        const enrichedItems = items.map(it => ({ ...it, sourceId }));
        results.push(...enrichedItems);
      } else {
        const msg = `Search failed: ${r.status} ${r.text?.substring(0, 50)}`;
        console.warn(`[Proxy] ${msg}`);
        errors.push({ sourceId, message: msg });
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  // Cache and return
  // setCache(cacheKey, results, 60); // Cache for 1 minute (Disable cache for now to debug)
  res.json({ query: q, count: results.length, results, errors });
});

module.exports = router;
