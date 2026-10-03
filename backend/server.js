const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    if (process.env.NODE_ENV !== 'production') console.log('MongoDB Connected');
  })
  .catch(err => console.error('MongoDB Connection Error:', err));

// Middleware
app.use(helmet()); 
app.use(compression()); 
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/entries', require('./routes/entries'));
app.use('/api/search', require('./routes/proxy'));

if (require.main === module) {
  app.listen(PORT, () => console.log(`Backend Proxy running on port ${PORT}`));
}

module.exports = app;
