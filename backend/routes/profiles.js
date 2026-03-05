const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET api/profiles
// @desc    Get all profiles for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/profiles
// @desc    Create a new profile
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name, avatar, isKids, pin } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (user.profiles.length >= 5) {
      return res.status(400).json({ msg: 'Maximum 5 profiles allowed' });
    }
    user.profiles.push({ name, avatar, isKids, pin });
    await user.save();
    res.json(user.profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/profiles/:id
// @desc    Delete a profile
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.profiles = user.profiles.filter(p => p.id !== req.params.id);
    await user.save();
    res.json(user.profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
