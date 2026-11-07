import Joi from 'joi';

/** VALIDERINGSREGLER for HTTP-input (før service og database).
 * Mongooses schema validerer også, men beskytter et andet lag.
 */
const fields = {
  name: Joi.string().trim().min(1).max(100),
  actor: Joi.string().trim().min(1).max(100),
  species: Joi.string().trim().min(1).max(70),
  firstAppearance: Joi.number().integer().min(1963).max(2200),
  homePlanet: Joi.string().trim().min(1).max(70),
  description: Joi.string().allow('').max(500),
  isFavorite: Joi.boolean()
};
export const createCharacterSchema = Joi.object({
  ...fields,
  name: fields.name.required(), actor: fields.actor.required(),
  species: fields.species.required(), firstAppearance: fields.firstAppearance.required(),
  homePlanet: fields.homePlanet.required()
}).unknown(false);
export const updateCharacterSchema = Joi.object(fields).min(1).unknown(false);
