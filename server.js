// server.js
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;

// Adatbázis kapcsolódás
const dbPath = path.resolve(__dirname, 'database', 'webshop.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Nem sikerült csatlakozni az adatbázishoz:', err.message);
  } else {
    console.log('Kapcsolódva az adatbázishoz.');
  }
});

// JSON és URL-encoded body kezelése
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statikus fájlok kiszolgálása
app.use(express.static(path.join(__dirname, 'public')));

// Teszt végpont
app.get('/api/test', (req, res) => {
  res.json({ message: 'Szerver működik!' });
});

// API: termékek listázása
app.get('/select', (req, res) => {
    const sql = `
      SELECT products.id, products.name, products.description, products.price, categories.name AS category
      FROM products
      LEFT JOIN categories ON products.category_id = categories.id
    `;
  
    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error('Hiba a lekérdezésnél:', err.message);
        return res.status(500).json({ error: 'Lekérdezési hiba' });
      }
      res.json(rows);
    });
  });

// API: termékek hozzáadása
  app.get('/api/kategoriak', (req, res) => {
    db.all('SELECT id, name FROM categories', [], (err, rows) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Lekérdezési hiba' });
      }
      res.json(rows);
    });
  });

  app.post('/insert', (req, res) => {
    const { name, description, price, category_id } = req.body;
  
    const sql = `INSERT INTO products (name, description, price, category_id) VALUES (?, ?, ?, ?)`;
    db.run(sql, [name, description, price, category_id], function(err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Beszúrási hiba' });
      }
      res.json({ success: true, id: this.lastID });
    });
  });  

// Hibakezelés
app.use((req, res, next) => {
  res.status(404).json({ error: 'Az oldal nem található.' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Belső szerverhiba.' });
});

// Szerver indítása
app.listen(PORT, () => {
  console.log(`Szerver fut a http://localhost:${PORT} címen`);
});


