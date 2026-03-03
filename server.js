const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(express.json()); // Parse JSON bodies
app.use(morgan('combined')); // Logging

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Example API endpoints
app.get('/api/health', (req, res) => {
  res.status(200).send('API is healthy.');
});

app.post('/api/data',
  body('data').isString().isLength({ min: 1 }), // Input validation
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Handle valid data
    res.status(201).send({ message: 'Data received', data: req.body.data });
  }
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});