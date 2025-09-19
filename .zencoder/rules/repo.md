# Repository: KERALA-MIGRANTS

This repo contains a minimal full-stack example for a Migrant Health Record Portal with:

- **server**: Node.js/Express API implementing Register, Verify, and Login, returning a token and basic profile info.
- **client**: React SPA implementing tabs for Register/Verify/Login and a simple Dashboard. Uses in-memory state and native `fetch` against the server.

## API Endpoints
- POST `/api/register` → Creates record after validating (aadhaar, phone, kms_id, dob). Returns `health_id`, `barcode_id`.
- POST `/api/verify` → Verifies record by any identifier.
- POST `/api/login` → Logs in via aadhaar/barcode/kms_id/phone (+ optional dob). Returns a mock JWT token.
- GET `/api/me` → Returns basic profile with `Authorization: Bearer <token>` header.

## Client Screens
- Register, Verify, Login (tabs)
- Dashboard (navigates after successful verification or login)

## Run (suggested)
1) In `server`: `npm install` then `npm start`
2) In `client`: `npm install` then `npm run dev`

Adjust client API base URL as needed in `src/api.ts`.