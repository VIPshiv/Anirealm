const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const auth = require('../middleware/auth');

// @route   GET api/entries
// @desc    Get all entries for user and profile
// @access  Private
router.get('/', auth, async (req, res) => {
  const profileId = req.header('x-profile-id');
  if (!profileId) return res.status(400).json({ msg: 'Profile ID required' });

  try {
    const entries = await Entry.find({ user: req.user.id, profileId }).sort({ updatedAt: -1 });
    res.json(entries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/entries
// @desc    Create entry
// @access  Private
router.post('/', auth, async (req, res) => {
  const profileId = req.header('x-profile-id');
  if (!profileId) return res.status(400).json({ msg: 'Profile ID required' });

  const { type, title, externalId, image, status, progress, total, score, watchedEpisodes, readChapters } = req.body;
  try {
    const newEntry = new Entry({
      user: req.user.id,
      profileId,
      type,
      title,
      externalId,
      image,
      status,
      progress,
      total,
      score,
      watchedEpisodes,
      readChapters
    });
    const entry = await newEntry.save();
    res.json(entry);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/entries/:id
// @desc    Update entry
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { type, title, externalId, image, status, progress, total, score, watchedEpisodes, readChapters } = req.body;
  const entryFields = {};
  if (type) entryFields.type = type;
  if (title) entryFields.title = title;
  if (externalId) entryFields.externalId = externalId;
  if (image) entryFields.image = image;
  if (status) entryFields.status = status;
  if (progress !== undefined) entryFields.progress = progress;
  if (total !== undefined) entryFields.total = total;
  if (score !== undefined) entryFields.score = score;
  if (watchedEpisodes) entryFields.watchedEpisodes = watchedEpisodes;
  if (readChapters) entryFields.readChapters = readChapters;
  entryFields.updatedAt = Date.now();

  try {
    let entry = await Entry.findById(req.params.id);
    if (!entry) return res.status(404).json({ msg: 'Entry not found' });
    if (entry.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    entry = await Entry.findByIdAndUpdate(req.params.id, { $set: entryFields }, { new: true });
    res.json(entry);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/entries/:id
// @desc    Delete entry
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let entry = await Entry.findById(req.params.id);
    if (!entry) return res.status(404).json({ msg: 'Entry not found' });
    if (entry.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    await Entry.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Entry removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
