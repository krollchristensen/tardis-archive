import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';

/** MIDDLEWARE: Kontrollér input FØR controller. */
export function validateBody(schema) {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) return next(new AppError(error.details.map(d => d.message).join('; '), 400));
    req.body = value;
    next();
  };
}
export function validateId(req, _res, next) {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    return next(new AppError('Ugyldigt karakter-ID', 400));
  }
  next();
}
