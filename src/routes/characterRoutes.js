import { Router } from 'express';
import { characterController as c } from '../controllers/characterController.js';
import { validateBody, validateId } from '../middleware/validateCharacter.js';
import { createCharacterSchema, updateCharacterSchema } from '../validators/characterValidator.js';

/** ROUTE: URI + HTTP-metode + middleware + controller. Ingen logik her. */
export const characterRouter = Router();
characterRouter.get('/', c.list);
characterRouter.get('/:id', validateId, c.get);
characterRouter.post('/', validateBody(createCharacterSchema), c.create);
characterRouter.put('/:id', validateId, validateBody(updateCharacterSchema), c.update);
characterRouter.delete('/:id', validateId, c.remove);
