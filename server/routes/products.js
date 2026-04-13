const express = require('express');
const router = express.Router();
const { db } = require('../firebase');

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('products').get();
    const products = [];
    snapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
