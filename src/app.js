import express from 'express';
import { characterRouter } from './routes/characterRoutes.js';
import { searchShows } from './controllers/externalController.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

/** APP: Samler alle komponenter. Start IKKE serveren i denne fil.
 * Det gør det muligt at teste API'et med Supertest uden en åben port.
 */
export const app = express();
app.use(express.json({ limit: '20kb' }));
app.use(express.static('public'));
app.use('/api/characters', characterRouter);
app.get('/api/external/shows', searchShows);
app.use('/api', notFound);
app.use(errorHandler); // SKAL stå efter routes og notFound.
