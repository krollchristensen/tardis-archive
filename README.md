# TARDIS Archive – undervisningstemplate til 3. semester

> **Formål:** Forstå lagdelt Node.js-arkitektur, ikke blot kopiere en kørende løsning.  
> Teknologi: Node.js 20+, Express 5, MongoDB, Mongoose, Joi, Vitest, Supertest og en enkel frontend.

Dette er et **færdigt referenceprojekt**, men koden er kommenteret med ansvar og begrundelser. Brug det først som et kort over, hvordan et system er bygget, og derefter som grundlag for små ændringer. Vi bruger **én MongoDB-collection (`characters`) med flade dokumenter**. Ingen relationer, `populate()` eller indlejrede dokumenter.

## 1. I skal kunne

Når du har arbejdet med projektet, skal du kunne:

1. Følge en HTTP-request fra browser/Postman til MongoDB og retur.
2. Forklare ansvaret for route, middleware, controller, service, repository og model.
3. Oprette et Mongoose-schema, gemme data og bruge `async/await`.
4. Forklare forskellen mellem inputvalidering (Joi) og databasevalidering (Mongoose).
5. Skelne mellem `400`, `404`, `201`, `204`, `500`, `502` og `504`.
6. Teste API'et med Postman og automatiserede tests.
7. Forklare hvorfor det eksterne TVmaze-API er adskilt fra vores lokale database.

## 2. Installation

**Forudsætninger:** Node.js 20 eller nyere, npm og MongoDB Community Server lokalt (eller en selvvalgt MongoDB-installation). MongoDB skal være startet, før API'et starter.

```bash
npm install
```

Lav en kopi af `.env.example` med navnet `.env`:

```dotenv
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/tardis_archive
NODE_ENV=development
```

**Windows PowerShell:** `Copy-Item .env.example .env`  
**macOS/Linux:** `cp .env.example .env`

Indsæt de fire eksempelkarakterer i databasen:

```bash
npm run seed
```

Start udviklingsserveren:

```bash
npm run dev
```

Åbn `http://localhost:3000`. Frontenden henter data fra dit eget Express API. Når du stopper og starter serveren, er data stadig gemt i MongoDB.

**Hvis du får fejl:** Tjek, at MongoDB kører, at `.env` findes, at port 3000 er ledig, og at du har kørt `npm install`. Serveren starter bevidst ikke, hvis databasen ikke kan kontaktes. `seed` overskriver ikke eksisterende karakterer med samme navn.

## 3. Mappestruktur

```text
tardis-archive/
├── src/
│   ├── config/database.js             # Databaseforbindelse ved opstart
│   ├── routes/characterRoutes.js      # URL + HTTP-metode
│   ├── controllers/
│   │   ├── characterController.js     # Request/response
│   │   └── externalController.js      # HTTP-svar for eksternt API
│   ├── services/
│   │   ├── characterService.js        # Forretningsregler
│   │   └── tvmazeService.js           # Integration til TVmaze
│   ├── repositories/characterRepository.js # MongoDB-queries
│   ├── models/characterModel.js       # Mongoose-schema
│   ├── middleware/
│   │   ├── validateCharacter.js       # Requestvalidering
│   │   ├── errorHandler.js            # Fælles fejlhåndtering
│   │   └── notFound.js                # Ukendt endpoint
│   ├── validators/characterValidator.js # Joi-regler
│   ├── utils/AppError.js              # Kontrollerede fejl
│   ├── app.js                         # Express-opsætning
│   └── server.js                      # Serverstart
├── public/                             # Simpel HTML/CSS/fetch
├── tests/character.test.js            # HTTP-tests med testdatabase
├── scripts/seed.js                    # Import af eksempeldata
├── data/doctors.json                  # Flade eksempeldata
├── docs/architecture.md              # Mermaid-diagram og ansvar
├── AI_LOG.md
├── .env.example
└── package.json
```

## 4. Hvordan bevæger en request sig?

Se `docs/architecture.md` for Mermaid-diagram og en oversigt over lagenes ansvar.

**Eksempel: POST /api/characters**

1. `app.js` registrerer routes og middleware.
2. `characterRoutes.js` matcher POST og aktiverer Joi-validering.
3. `characterController.js` modtager `req.body`, kalder service og svarer `201`.
4. `characterService.js` er stedet for forretningsregler.
5. `characterRepository.js` kalder Mongoose.
6. `characterModel.js` beskriver datatyper og gemmevalidering.
7. MongoDB gemmer dokumentet, og svaret sendes tilbage via controlleren.

**Stop og forklar:** Hvorfor skal controlleren ikke kalde `Character.create()` direkte? Hvorfor skal modellen ikke sende `res.status(400)`?

## 5. REST-endpoints

| Metode | URL | Formål | Succes |
| --- | --- | --- | --- |
| GET | `/api/characters` | Alle karakterer | 200 |
| GET | `/api/characters?name=Doctor` | Søg efter navn | 200 |
| GET | `/api/characters/:id` | En karakter | 200 |
| POST | `/api/characters` | Opret karakter | 201 + Location |
| PUT | `/api/characters/:id` | Opdater felter (delvis opdatering i denne demo) | 200 |
| DELETE | `/api/characters/:id` | Slet karakter | 204 uden body |
| GET | `/api/external/shows` | Søg efter Doctor Who-serier på TVmaze | 200 |

**OBS:** `PUT` er her bevidst implementeret som *delvis opdatering*, selvom `PATCH` normalt ville være mere præcist. Diskutér om I vil omdøbe endpointet til `PATCH`, eller kræve et komplet objekt ved `PUT`.

### Eksempel i Postman

**POST** `http://localhost:3000/api/characters`  
Header: `Content-Type: application/json`

```json
{
  "name": "The Ninth Doctor",
  "actor": "Christopher Eccleston",
  "species": "Time Lord",
  "firstAppearance": 2005,
  "homePlanet": "Gallifrey",
  "description": "Den niende Doctor",
  "isFavorite": false
}
```

Kopiér `id` fra resultatet og prøv:

```http
GET http://localhost:3000/api/characters/<id>
PUT http://localhost:3000/api/characters/<id>
DELETE http://localhost:3000/api/characters/<id>
```

Ved PUT kan du eksempelvis sende `{"isFavorite": true}` som JSON-body.

**Forudsig svaret, før du trykker Send:** Hvad sker der ved ukendt gyldigt ID? Ved `abc` som ID? Ved manglende `name` i POST? Ved `firstAppearance: 100`? Ved et ukendt endpoint?

## 6. Eksternt API

`GET /api/external/shows` kalder **TVmaze** og udvælger kun felterne `externalId`, `title`, `premiered`, `status` og `tvmazeUrl` med `.map()`. Det er en bevidst demonstration af data-transformation. TVmaze giver oplysninger om TV-serier — ikke Doctor Who-karakterer — og denne integration er **adskilt fra** den lokale karakter-CRUD. Ingen eksterne data gemmes automatisk.

Dokumentation: https://www.tvmaze.com/api  
Attribution: https://www.tvmaze.com (TVmaze-data, CC BY-SA).

Test fejlscenarier: Hvad sker der, hvis tjenesten er nede? Hvorfor kan det være bedre at returnere HTTP 502/504 end 500?

## 7. Automatiserede tests

```bash
npm test
```

Testene bruger Vitest og Supertest mod en **midlertidig MongoDB** (`mongodb-memory-server`). Din lokale database bliver ikke ændret. Den første testkørsel kan kræve internet for at hente en MongoDB-testbinary. Testen af TVmaze bruger mock og kræver ikke forbindelse til TVmaze.

Find i `tests/character.test.js`:

- Succesfuld GET og POST.
- 400 ved manglende data og ugyldigt ID.
- 404 for ukendt karakter.
- PUT, DELETE og 204 uden body.
- Mock af ekstern integration.

**Øvelse:** Tilføj en test af søgning på navn, og en test der afviser `firstAppearance` før 1963.

## 8. Aktive øvelser (lav dem i rækkefølge)

**Øvelse 1 – Find ansvaret.** Åbn projektet, og find den fil, der modtager POST-requesten, validerer input, beslutter hvad der skal gemmes, og skriver til databasen. Tegn request-flowet uden at kigge på diagrammet. Sammenlign bagefter med `docs/architecture.md`.

**Øvelse 2 – Forudsig fejl.** Brug Postman. Send først gyldige requests, derefter ugyldige. Skriv forventet statuskode *inden* du sender. Forklar hvor i koden fejlen opstår, og hvem der laver HTTP-svaret.

**Øvelse 3 – Udvid modellen.** Tilføj feltet `catchphrase` som en valgfri tekststreng. Hvilke filer skal opdateres? Du skal kunne begrunde hver ændring: model, Joi-validator, eksempeldata, frontend og test. Brug ikke en ny route til et almindeligt felt.

**Øvelse 4 – Forretningsregel.** En karakter må ikke gemmes med navnet `Unknown`. Læg reglen i `characterService.js`, og skriv en test. Undersøg om reglen også skal gælde ved opdatering. Tænk over forskellen mellem forretningsregler og grundlæggende typevalidering.

**Øvelse 5 – Code review med agent.** Spørg agenten: "Følg POST /api/characters gennem alle lag. Find én konkret forbedring af ansvarsfordeling eller fejlhåndtering. Lav ikke kodeændringer endnu." Kontroller agentens svar i koden. Implementér højst én begrundet ændring, gennemgå diffen, test og dokumentér i `AI_LOG.md`.

**Ekstraopgaver:** Udvid med sortering eller filtrering på `species`, tilføj en PATCH-route, forbedr 404-tests, eller skriv en ekstra test af TVmaze-timeout. Begynd ikke med ekstraopgaverne, før du kan forklare hele POST-flowet.

## 9. Eksamenscheckpoint

Uden at læse fra README'en skal du kunne:

1. Demonstrere `POST /api/characters` i Postman.
2. Følge requesten gennem alle filer og forklare hvert ansvar.
3. Forklare hvorfor `await` ikke blokerer Node.js' event loop, mens der ventes på MongoDB.
4. Vise mindst én gyldig og én ugyldig request.
5. Forklare, hvorfor HTTP 204 ikke sender JSON.
6. Vise en test og forklare, hvad den beviser – og hvad den **ikke** beviser.
7. Forklare hvilke ændringer en AI-agent foreslog, og hvordan du kontrollerede dem.

### Gode arkitekturspørgsmål

- Hvorfor skal en route være næsten tom?
- Hvorfor er services og repositories adskilt?
- Hvorfor opretter vi forbindelse til MongoDB ved opstart og ikke for hvert request?
- Hvilket lag ændrer du, hvis vi senere skifter database?
- Kan du skrive en test af servicelaget uden en rigtig database? Hvad kræver det?
- Hvilke ændringer ville du lave for et produktionssystem? (Logging, sikkerhed, mere konsekvent REST, drift).

