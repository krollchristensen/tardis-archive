# Arkitektur og ansvar

```mermaid
flowchart TD
    A[Browser eller Postman] --> B[Express app.js]
    B --> C[Middleware og router]
    C --> D[CharacterController]
    D --> E[CharacterService]
    E --> F[CharacterRepository]
    F --> G[CharacterModel - Mongoose]
    G --> H[(MongoDB - characters)]
    B --> X[Ekstern controller]
    X --> Y[TVmazeService]
    Y --> Z[TVmaze REST API]
    C -. fejl .-> R[ErrorHandler]
    D -. fejl .-> R
    E -. fejl .-> R
```

Alle datareturneringer går tilbage via controlleren som JSON. Ved fejl sendes et passende HTTP-svar fra errorHandler. **TVmaze-data gemmes ikke i MongoDB.**

## Ansvarsregler

| Lag | Har ansvar for | Må ikke gøre |
| --- | --- | --- |
| Router | HTTP-metode og URL | Databasequeries |
| Middleware | Validering af request | Forretningslogik |
| Controller | `req`, `res`, statuskoder | Kalde Mongoose |
| Service | Forretningsregler, koordinering | Bruge `req`, `res` |
| Repository | Læse/skrive via Mongoose | Afgøre HTTP-status |
| Model | Schema og DB-validering | Håndtere HTTP |
| Integrationsservice | HTTP-kald til TVmaze | Gemme direkte i MongoDB |

## Følg en request

`POST /api/characters` → `characterRoutes.js` → `validateCharacter.js` → `characterController.create()` → `characterService.create()` → `characterRepository.create()` → `Character.create()` → MongoDB → JSON med status 201.

Forklar hvert trin med din egen formulering. Hvilken fil ville du ændre, hvis en karakter ikke må gemmes med navnet `Unknown`? (En forretningsregel hører hjemme i service-laget.)
