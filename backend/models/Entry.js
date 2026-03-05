const mongoose = require('mongoose');

const EntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  profileId: { type: mongoose.Schema.Types.ObjectId, required: true },
  type: { type: String, enum: ['anime', 'manga'], default: 'anime' },
  title: { type: String, required: true },
  externalId: { type: Number }, // animeId or mangaId from external API
  image: { type: String },
  status: { 
    type: String, 
    default: 'Watching'
  },
  progress: { type: Number, default: 0 }, // episode or chapter number
  total: { type: Number }, // total episodes or chapters
  score: { type: Number, min: 0, max: 10 },
  watchedEpisodes: [{ type: Number }],
  readChapters: [{ type: Number }],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Entry', EntrySchema);
