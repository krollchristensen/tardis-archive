import { Character } from '../models/characterModel.js';

/** REPOSITORY: Det eneste lag, der bruger Mongoose-metoder.
 * En controller må ALDRIG kalde Character.find() direkte.
 * Repository ved intet om HTTP-statuskoder.
 */
export const characterRepository = {
  findAll(name) {
    const filter = name ? { name: { $regex: escapeRegex(name), $options: 'i' } } : {};
    return Character.find(filter).sort({ name: 1 });
  },
  findById(id) { return Character.findById(id); },
  create(data) { return Character.create(data); },
  update(id, data) { return Character.findByIdAndUpdate(id, data, { new: true, runValidators: true }); },
  remove(id) { return Character.findByIdAndDelete(id).lean(); }
};

// Søgetekst må ikke fungere som et regulært udtryk fra klienten.
function escapeRegex(text) { return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
