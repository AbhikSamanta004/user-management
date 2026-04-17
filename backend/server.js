const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

dotenv.config();

const auth = require('./routes/auth');
const users = require('./routes/users');

const app = express();

app.use(express.json());

app.use(cors());

app.use('/api/auth', auth);
app.use('/api/users', users);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server Error' });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
  })
  .catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
