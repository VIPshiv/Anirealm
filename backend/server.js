const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();
const dbConnect = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

// Connect to Mongo (cached) only for routes that use the DB
const withDb = async (req, res, next) => {
  try {
    await dbConnect();
    next();
  } catch (e) {
    console.error('DB CONNECT ERROR:', e.message);
    res.status(500).json({ message: 'DB error: ' + e.message });
  }
};

// Routes
app.use('/api/auth', withDb, require('./routes/auth'));
app.use('/api/profiles', withDb, require('./routes/profiles'));
app.use('/api/entries', withDb, require('./routes/entries'));
app.use('/api/search', require('./routes/proxy')); // no DB needed

if (require.main === module) {
  app.listen(PORT, () => console.log(`Backend Proxy running on port ${PORT}`));
}

module.exports = app;