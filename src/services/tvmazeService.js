import { AppError } from '../utils/AppError.js';

/** EKSTERN SERVICE: Integrerer med TVmaze — adskilt fra lokal MongoDB.
 * https://www.tvmaze.com/api (gratis, uden API-nøgle).
 * Vi gemmer IKKE eksterne svar direkte i MongoDB.
 */
export const tvmazeService = {
  async searchDoctorWho() {
    let response;
    try {
      response = await fetch('https://api.tvmaze.com/search/shows?q=Doctor%20Who', {
        headers: { 'User-Agent': 'TardisArchiveTeachingDemo/1.0' },
        signal: AbortSignal.timeout(5000)
      });
    } catch (err) {
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        throw new AppError('TVmaze svarede ikke i tide', 504);
      }
      throw new AppError('TVmaze er ikke tilgængeligt', 502);
    }
    if (!response.ok) throw new AppError('Fejl hos TVmaze', 502);
    let data;
    try { data = await response.json(); } catch { throw new AppError('Ugyldigt JSON-svar fra TVmaze', 502); }
    if (!Array.isArray(data)) throw new AppError('Uventet dataformat fra TVmaze', 502);
    return data.map(({ show }) => ({
      externalId: show.id, title: show.name, premiered: show.premiered,
      status: show.status, tvmazeUrl: show.url
    }));
  }
};
