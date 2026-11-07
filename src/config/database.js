import mongoose from 'mongoose';

/** CONFIG: Databaseforbindelsen oprettes ÉN gang ved serverstart.
 * Hverken controller eller service skal selv kalde mongoose.connect().
 */
export async function connectDatabase(uri) {
  if (!uri) throw new Error('MONGODB_URI mangler i .env');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log('MongoDB er forbundet');
}
