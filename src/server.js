import 'dotenv/config';
import mongoose from 'mongoose';
import { app } from './app.js';
import { connectDatabase } from './config/database.js';

/** SERVER: Konfiguration, DB-forbindelse og serverstart.
 * Start først HTTP-serveren, når databasen kan kontaktes.
 */
try {
  await connectDatabase(process.env.MONGODB_URI);
  const server = app.listen(Number(process.env.PORT || 3000), () => {
    console.log(`TARDIS Archive: http://localhost:${process.env.PORT || 3000}`);
  });
  async function shutdown() {
    server.close(async () => { await mongoose.disconnect(); process.exit(0); });
  }
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
} catch (err) {
  console.error('Serveren kunne ikke starte:', err.message);
  process.exit(1);
}
