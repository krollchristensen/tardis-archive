import { characterRepository } from '../repositories/characterRepository.js';
import { AppError } from '../utils/AppError.js';

/** SERVICE: Forretningsregler og koordinering.
 * Ingen req/res, ingen Express og ingen direkte Mongoose-queries.
 * Her kan de studerende eksempelvis tilføje en regel om favoritstatus.
 */
export const characterService = {
  list(name) { return characterRepository.findAll(name); },
  async get(id) {
    const character = await characterRepository.findById(id);
    if (!character) throw new AppError('Karakteren blev ikke fundet', 404);
    return character;
  },
  create(data) { return characterRepository.create(data); },
  async update(id, data) {
    const character = await characterRepository.update(id, data);
    if (!character) throw new AppError('Karakteren blev ikke fundet', 404);
    return character;
  },
  async remove(id) {
    const character = await characterRepository.remove(id);
    if (!character) throw new AppError('Karakteren blev ikke fundet', 404);
  }
};
