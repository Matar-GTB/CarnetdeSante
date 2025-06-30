require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => res.send('API Carnet de Santé OK'));
app.listen(PORT, () => console.log(`API listening on ${PORT}`));