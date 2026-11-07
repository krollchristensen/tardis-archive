import { beforeAll, afterAll, afterEach, describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/app.js';
import { Character } from '../src/models/characterModel.js';

/** Integrationstests: Supertest + midlertidig MongoDB.
 * Tester rigtige HTTP-routes uden at starte server.js.
 * Første kørsel kan downloade en MongoDB-testbinary; kræver internet.
 */
let database;
beforeAll(async () => {
  database = await MongoMemoryServer.create();
  await mongoose.connect(database.getUri());
});
afterEach(async () => { await Character.deleteMany({}); vi.restoreAllMocks(); });
afterAll(async () => { await mongoose.disconnect(); await database.stop(); });

const sample = {name:'The Fourth Doctor',actor:'Tom Baker',species:'Time Lord',firstAppearance:1974,homePlanet:'Gallifrey'};
describe('Character REST API', () => {
  it('GET returnerer tom liste', async () => {
    const res = await request(app).get('/api/characters');
    expect(res.status).toBe(200); expect(res.body).toEqual([]);
  });
  it('POST opretter med 201 og Location', async () => {
    const res = await request(app).post('/api/characters').send(sample);
    expect(res.status).toBe(201);expect(res.headers.location).toContain('/api/characters/');
    expect(res.body.name).toBe('The Fourth Doctor');
  });
  it('POST afviser manglende navn med 400', async () => {
    const {name, ...invalid} = sample;
    const res = await request(app).post('/api/characters').send(invalid);
    expect(res.status).toBe(400);
  });
  it('GET ukendt, men gyldigt ID giver 404', async () => {
    const res = await request(app).get('/api/characters/507f191e810c19729de860ea');
    expect(res.status).toBe(404);
  });
  it('GET ugyldigt ID giver 400', async () => {
    const res = await request(app).get('/api/characters/abc');
    expect(res.status).toBe(400);
  });
  it('PUT ændrer og DELETE fjerner karakteren', async () => {
    const created = await request(app).post('/api/characters').send(sample);
    const id = created.body.id;
    const updated = await request(app).put(`/api/characters/${id}`).send({actor:'En anden skuespiller'});
    expect(updated.status).toBe(200);expect(updated.body.actor).toBe('En anden skuespiller');
    const removed = await request(app).delete(`/api/characters/${id}`);
    expect(removed.status).toBe(204);expect(removed.text).toBe('');
    expect((await request(app).get(`/api/characters/${id}`)).status).toBe(404);
  });
  it('Eksternt API transformerer data, uden at kalde rigtigt internet', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ok:true,json:async()=>[{show:{id:42,name:'Doctor Who',premiered:'2005-03-26',status:'Running',url:'https://www.tvmaze.com/shows/42'}}]});
    const res = await request(app).get('/api/external/shows');
    expect(res.status).toBe(200);expect(res.body[0].title).toBe('Doctor Who');
  });
});
