import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  const referer = request.nextUrl.searchParams.get('referer');

  if (!url) {
    return new NextResponse('Missing URL', { status: 400 });
  }

  // --- Security: Whitelist ---
  try {
    const urlObj = new URL(url);
    const ALLOWED_DOMAINS = ['gogocdn.net', 'goload.pro', 'api.consumet.org', 'storage.googleapis.com', 'fonts.googleapis.com'];
    // In production, uncomment the next line to enforce security
    // if (!ALLOWED_DOMAINS.some(d => urlObj.hostname.endsWith(d))) return new NextResponse('Forbidden Domain', { status: 403 });
  } catch (e) {
    return new NextResponse('Invalid URL', { status: 400 });
  }
  // ---------------------------

  try {
    const headers: HeadersInit = {};
    if (referer) {
      headers['Referer'] = referer;
    }
    // Add User-Agent to look like a browser
    headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

    // Forward Range header for video seeking
    const range = request.headers.get('range');
    if (range) {
      headers['Range'] = range;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      return new NextResponse(`Upstream error: ${response.status}`, { status: response.status });
    }

    const newHeaders = new Headers();
    newHeaders.set('Access-Control-Allow-Origin', '*');
    
    // Forward important headers
    const headersToForward = ['content-type', 'content-length', 'content-range', 'accept-ranges'];
    headersToForward.forEach(h => {
      const val = response.headers.get(h);
      if (val) newHeaders.set(h, val);
    });

    const contentType = response.headers.get('content-type');

    // Handle HLS Manifest rewriting
    if (contentType && (contentType.includes('application/vnd.apple.mpegurl') || contentType.includes('application/x-mpegURL') || url.endsWith('.m3u8'))) {
        const text = await response.text();
        const baseUrl = new URL(url);
        const proxyBase = `${request.nextUrl.origin}${request.nextUrl.pathname}?referer=${encodeURIComponent(referer || '')}&url=`;
        
        const rewritten = text.split('\n').map(line => {
            const trimmed = line.trim();
            if (!trimmed) return line;

            if (trimmed.startsWith('#')) {
                // Handle URI attributes in tags like #EXT-X-KEY, #EXT-X-MAP
                return trimmed.replace(/URI="([^"]+)"/g, (match, uri) => {
                    let absoluteUrl = uri;
                    if (!uri.startsWith('http')) {
                        absoluteUrl = new URL(uri, baseUrl).toString();
                    }
                    const proxiedUrl = `${proxyBase}${encodeURIComponent(absoluteUrl)}`;
                    return `URI="${proxiedUrl}"`;
                });
            } else {
                // It's a URL (segment or playlist)
                if (trimmed.startsWith('http')) {
                    return `${proxyBase}${encodeURIComponent(trimmed)}`;
                } else {
                    // Resolve relative URL
                    const absoluteUrl = new URL(trimmed, baseUrl).toString();
                    return `${proxyBase}${encodeURIComponent(absoluteUrl)}`;
                }
            }
        }).join('\n');

        return new NextResponse(rewritten, { status: 200, headers: newHeaders });
    }

    // Stream the response body for non-text (video/mp4)
    return new NextResponse(response.body, {
      status: response.status,
      headers: newHeaders,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}