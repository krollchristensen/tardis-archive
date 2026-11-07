import mongoose from 'mongoose';

/** MODEL: Beskriver strukturen og databasevalideringen.
 * Ingen HTTP-objekter (req/res), ingen routing og ingen forretningsprocesser her.
 * ÉN flad collection: ingen relationer, referencer eller indlejrede dokumenter.
 */
const characterSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  actor: { type: String, required: true, trim: true, maxlength: 100 },
  species: { type: String, required: true, trim: true, maxlength: 70 },
  firstAppearance: { type: Number, required: true, min: 1963, max: 2200 },
  homePlanet: { type: String, required: true, trim: true, maxlength: 70 },
  description: { type: String, default: '', maxlength: 500 },
  isFavorite: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });

// Gør JSON mere forståelig: id i stedet for _id, undlad intern __v.
characterSchema.set('toJSON', {
  transform: (_, data) => {
    data.id = String(data._id);
    delete data._id;
    return data;
  }
});
export const Character = mongoose.model('Character', characterSchema);
