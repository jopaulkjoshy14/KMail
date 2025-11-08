require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const mailRoutes = require('./routes/mail');
const app = express();

app.use(express.json());
app.use('/api/mail', mailRoutes);

mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(3001, () => console.log('Backend running on port 3001'));
});
