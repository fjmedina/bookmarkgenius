import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

const client = createClient({
  url: "libsql://bookmarkgenius-fjmedina.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3MzE2Nzg4OTYsImlkIjoiZjU4NDc0MTQtNzkzOS00Y2ZkLTk3YmUtYzc1ZjI1MDNmNDQ1In0.-G-rNjs5DsDTKQW-772nKrfzFSrhi0WOA8Y3QAol95aJnc5lOGPMyjxgOPaGS7cvPc5s9a4TEFqL1--m5l59Cw",
  tls: { rejectUnauthorized: false }
});

async function initDB() {
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        author_id INTEGER NOT NULL,
        category TEXT NOT NULL,
        published BOOLEAN DEFAULT false,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id)
      )
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS pages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        content TEXT NOT NULL,
        published BOOLEAN DEFAULT false,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create default admin user if it doesn't exist
    const adminExists = await client.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: ['admin@bookmarkgenius.com']
    });

    if (!adminExists.rows.length) {
      const password = await bcrypt.hash('admin123', 10);
      await client.execute({
        sql: 'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
        args: ['admin@bookmarkgenius.com', password, 'Admin']
      });
      console.log('Admin user created successfully');
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDB();