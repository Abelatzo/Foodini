const express = require('express');
const router = express.Router();
const { admin, db, auth } = require('../firebase');

// ── REGISTRO ──────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });

  try {
    // Crear usuario en Firebase Auth
    const userRecord = await auth.createUser({ email, password, displayName: name });

    // Guardar datos extra en Firestore
    await db.collection('users').doc(userRecord.uid).set({
      name,
      email,
      plan: 'free',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({ message: 'Usuario registrado', uid: userRecord.uid });

  } catch (error) {
    if (error.code === 'auth/email-already-exists')
      return res.status(400).json({ error: 'Este correo ya está registrado' });
    res.status(500).json({ error: error.message });
  }
});

// ── LOGIN ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Correo y contraseña requeridos' });

  try {
    // Verificar que el usuario existe en Auth
    const userRecord = await auth.getUserByEmail(email);

    // Obtener datos adicionales de Firestore
    const userDoc = await db.collection('users').doc(userRecord.uid).get();

    if (!userDoc.exists)
      return res.status(404).json({ error: 'Usuario no encontrado en base de datos' });

    const userData = userDoc.data();

    // Generar token de sesión
    const customToken = await auth.createCustomToken(userRecord.uid);

    res.json({
      message: 'Login exitoso',
      token: customToken,
      user: {
        uid: userRecord.uid,
        name: userData.name,
        email: userData.email,
        plan: userData.plan
      }
    });

  } catch (error) {
    if (error.code === 'auth/user-not-found')
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
