import { characterService } from '../services/characterService.js';

/** CONTROLLER: Oversætter HTTP request til servicekald og HTTP response.
 * Ingen forretningsregler og INGEN direkte databaseadgang.
 * Express 5 sender fejl fra async funktioner til errorHandler automatisk.
 */
export const characterController = {
  async list(req, res) {
    const characters = await characterService.list(req.query.name);
    res.json(characters);
  },
  async get(req, res) {
    res.json(await characterService.get(req.params.id));
  },
  async create(req, res) {
    const created = await characterService.create(req.body);
    res.status(201).location(`/api/characters/${created.id}`).json(created);
  },
  async update(req, res) {
    res.json(await characterService.update(req.params.id, req.body));
  },
  async remove(req, res) {
    await characterService.remove(req.params.id);
    res.status(204).send(); // 204 har aldrig en JSON-body.
  }
};
