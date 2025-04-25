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

// Userek listázása
app.get('/api/users', (req, res) => {
    db.all('SELECT id, name FROM users', [] ,(err, rows) => {
      if (err) {
        console.error("Hiba a felhasználók lekérésekor:", err);
        return res.status(500).json({ error: "DB error" });
      }
      res.json(rows); 
    });
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

// Rendelések lekérdezése
app.get('/api/orders', (req, res) => {
    db.all(`
      SELECT o.id, o.order_date, u.name AS user_name, p.name AS product_name, oi.quantity, p.price 
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      ORDER BY o.order_date DESC
    `, (err, rows) => {
      if (err) {
        res.status(500).json({ message: 'Hiba a rendeléseket lekérdezésében.' });
        return;
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
  
// API: rendelés leadása
  app.post('/api/rendeles', (req, res) => {
    const { user_id, items } = req.body;
  
    if (!user_id || !Array.isArray(items) || items.length === 0) {
      return res.json({ success: false, message: 'Hiányzó adatok' });
    }
  
    db.run(
      `INSERT INTO orders (user_id) VALUES (?)`,
      [user_id],
      function(err) {
        if (err) return res.json({ success: false, message: 'Hiba az orders mentésekor' });
  
        const orderId = this.lastID;
  
        const stmt = db.prepare(`
          INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)
        `);
  
        items.forEach(item => {
          stmt.run(orderId, item.id, 1);
        });
  
        stmt.finalize(err => {
          if (err) return res.json({ success: false, message: 'Hiba a tételek mentésekor' });
          res.json({ success: true });
        });
      }
    );
  });

// API: termék törlése
app.delete('/delete/:id', (req, res) => {
  const productId = req.params.id;

  const sql = `DELETE FROM products WHERE id = ?`;

  db.run(sql, [productId], function(err) {
    if (err) {
      console.error('Hiba a törlés során:', err.message);
      return res.status(500).json({ error: 'Törlés hiba' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'A termék nem található' });
    }

    res.json({ success: true, message: 'Termék törölve' });
  });
});

// API: termék módosítása
app.put('/api/termek/:id', (req, res) => {
  const { name, description, price, category_id } = req.body;
  const { id } = req.params;

  const sql = `UPDATE products SET name = ?, description = ?, price = ?, category_id = ? WHERE id = ?`;
  db.run(sql, [name, description, price, category_id, id], function(err) {
    if (err) {
      console.error('Hiba a módosításnál:', err.message);
      return res.status(500).json({ error: 'Módosítási hiba' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Termék nem található' });
    }
    res.json({ success: true });
  });
});

// Egy termék lekérdezése ID alapján
app.get('/api/termek/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Hiba az adat lekérdezésénél:', err.message);
      return res.status(500).json({ error: 'Lekérdezési hiba' });
    }
    if (!row) {
      return res.status(404).json({ error: 'A termék nem található' });
    }
    res.json(row);
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


