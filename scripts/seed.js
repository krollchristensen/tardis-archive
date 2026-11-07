import 'dotenv/config';
import mongoose from 'mongoose';
import { readFile } from 'node:fs/promises';
import { connectDatabase } from '../src/config/database.js';
import { Character } from '../src/models/characterModel.js';

// Seed er bevidst separat fra API'et. Den sletter ALDRIG eksisterende data.
try {
  await connectDatabase(process.env.MONGODB_URI);
  const characters = JSON.parse(await readFile(new URL('../data/doctors.json', import.meta.url), 'utf8'));
  let added = 0;
  for (const character of characters) {
    const exists = await Character.exists({ name: character.name });
    if (!exists) { await Character.create(character); added++; }
  }
  console.log(`${added} nye karakterer indsat`);
} catch (err) {
  console.error('Seed fejlede:', err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
