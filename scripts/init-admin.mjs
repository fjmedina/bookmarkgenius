import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

const client = createClient({
  url: process.env.TURSO_DB_URL ?? 'file:content.db',
  authToken: process.env.TURSO_DB_AUTH_TOKEN
});

async function createAdminUser() {
  try {
    // Hash the password
    const password = await bcrypt.hash('admin123', 10);

    // Create admin user
    await client.execute({
      sql: 'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      args: ['admin@bookmarkgenius.com', password, 'Admin']
    });

    console.log('Admin user created successfully');
    console.log('Email: admin@bookmarkgenius.com');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser();