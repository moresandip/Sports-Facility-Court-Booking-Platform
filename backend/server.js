const fs = require('fs');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const log = (msg) => {
  try {
    fs.appendFileSync('server_debug.log', msg + '\n');
  } catch (e) {
    console.error("LOG ERROR", e);
  }
}
log('Starting server.js...');

process.on('uncaughtException', (err) => {
  log(`UNCAUGHT EXCEPTION: ${err.message}\n${err.stack}`);
  process.exit(1);
});

dotenv.config();
log('Dotenv configured');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sports-booking')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
// Routes
log('Loading courtRoutes...');
const courtRoutes = require('./routes/courtRoutes');
log('Loading equipmentRoutes...');
const equipmentRoutes = require('./routes/equipmentRoutes');
log('Loading coachRoutes...');
const coachRoutes = require('./routes/coachRoutes');
log('Loading bookingRoutes...');
const bookingRoutes = require('./routes/bookingRoutes');
log('Loading pricingRuleRoutes...');
const pricingRuleRoutes = require('./routes/pricingRuleRoutes');
log('All routes loaded.');

app.use('/api/courts', courtRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/coaches', coachRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/pricing-rules', pricingRuleRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Sports Facility Booking API is running' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
