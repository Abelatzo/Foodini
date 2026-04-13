const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: __dirname + '/.env' });

const authRoutes    = require('./routes/auth');
const productRoutes = require('./routes/products');
const paymentRoutes = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Rutas
app.use('/api/auth',    authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payment',  paymentRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 FoodNear corriendo en http://localhost:${PORT}`);
});
