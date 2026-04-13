const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { db, admin } = require('../firebase');

router.post('/create-checkout', async (req, res) => {
  const { productId, productName, amount, userId } = req.body;

  try {
    // Crear sesión de pago en Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'mxn',
          product_data: { name: productName },
          unit_amount: amount * 100, // Stripe usa centavos
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'https://foodini-ochre.vercel.app/products.html?status=success',
      cancel_url:  'https://foodini-ochre.vercel.app/products.html?status=cancel',
    });

    // Guardar orden en Firestore
    await db.collection('orders').add({
      userId:    userId || 'guest',
      product:   productName,
      productId: productId,
      amount:    amount,
      status:    'pending',
      sessionId: session.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ url: session.url });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
