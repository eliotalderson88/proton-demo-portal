'use strict';
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Database = require('better-sqlite3');

const app = express();
const PORT = Number(process.env.PORT || 3000);
// Render Free usa almacenamiento temporal: DATABASE_PATH permite cambiarlo
// a un disco persistente si más adelante se contrata uno.
const databasePath = process.env.DATABASE_PATH || path.join(__dirname, 'data', 'proton.sqlite');
fs.mkdirSync(path.dirname(databasePath), { recursive: true });
const db = new Database(databasePath);
db.pragma('journal_mode = WAL');
db.exec(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);`);

const findUser = db.prepare('SELECT id, username, password_hash, password_salt FROM users WHERE username = ?');
const addUser = db.prepare('INSERT INTO users (username, password_hash, password_salt) VALUES (?, ?, ?)');

// Cuenta ficticia para pruebas: se configura desde Environment en Render.
// No se guardan claves ingresadas ni se registra el historial de intentos.
if (process.env.DEMO_USERNAME && process.env.DEMO_PASSWORD) {
  const demoUsername = String(process.env.DEMO_USERNAME).trim();
  const demoPassword = String(process.env.DEMO_PASSWORD);
  if (demoUsername && demoPassword && !findUser.get(demoUsername)) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(demoPassword, salt, 64).toString('hex');
    addUser.run(demoUsername, hash, salt);
    console.log('Cuenta ficticia de prueba configurada.');
  }
}

app.use(express.json({ limit: '16kb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/health', (_req, res) => res.status(200).json({ ok: true }));

app.post('/api/login', (req, res) => {
  const username = String(req.body?.username || '').trim();
  const password = String(req.body?.password || '');
  if (!username || !password) return res.status(400).json({ ok: false, message: 'Completá tu usuario y tu clave.' });
  if (username.length > 100 || password.length > 200) return res.status(400).json({ ok: false, message: 'Los datos ingresados no son válidos.' });
  const user = findUser.get(username);
  let valid = false;
  if (user) {
    const candidate = crypto.scryptSync(password, user.password_salt, 64);
    valid = crypto.timingSafeEqual(candidate, Buffer.from(user.password_hash, 'hex'));
  }
  if (!valid) return res.status(401).json({ ok: false, message: 'Usuario o clave incorrectos.' });
  return res.json({ ok: true, message: 'Inicio de sesión correcto.' });
});

// Alta local opcional: node server.js create-user usuario clave
if (require.main === module && process.argv[2] === 'create-user') {
  const username = String(process.argv[3] || '').trim();
  const password = String(process.argv[4] || '');
  if (!username || !password) {
    console.error('Uso: node server.js create-user <usuario> <clave>');
    process.exit(1);
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  try {
    addUser.run(username, hash, salt);
    console.log(`Usuario de prueba ${username} creado.`);
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  }
  db.close();
} else if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => console.log(`Demo disponible en el puerto ${PORT}.`));
}
