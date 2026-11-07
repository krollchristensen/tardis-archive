import { tvmazeService } from '../services/tvmazeService.js';
// Separat controller viser, at eksterne integrationer også passer gennem lagene.
export async function searchShows(_req, res) {
  res.json(await tvmazeService.searchDoctorWho());
}
