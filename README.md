# Future Vision Home React App

## Google review auth flow

This frontend now supports the browser side of a Google Sign-In review flow:

1. The user clicks the Google button on the EyeRoute page.
2. Google Identity Services returns a Google ID token to the frontend.
3. The frontend `POST`s that ID token to your backend.
4. The backend verifies the Google token and creates your own app session.
5. The frontend uses that app session to submit authenticated reviews.

The frontend files for this flow are:

- `src/context/ReviewAuthContext.jsx`
- `src/lib/googleIdentity.js`
- `src/api/reviewApi.js`
- `src/pages/EyeRoute.jsx`

## Frontend env setup

Create a `.env.local` file from `.env.example`.

```bash
VITE_GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
VITE_API_BASE_URL=https://your-api-id.execute-api.ap-southeast-1.amazonaws.com/prod
VITE_GOOGLE_AUTH_ENDPOINT=/auth/google
VITE_AUTH_SESSION_ENDPOINT=/auth/session
VITE_AUTH_SIGNOUT_ENDPOINT=/auth/logout
VITE_REVIEWS_ENDPOINT=/reviews
```

## Google Cloud setup

Use a `Web application` OAuth client.

- Add `http://localhost:5173` to `Authorized JavaScript origins` for Vite local development.
- Add your production frontend origin too, for example `https://yourdomain.com`.
- Because this frontend uses the Google popup callback flow, you do not need `Authorized redirect URIs` unless you switch to redirect mode later.
- Do not put the Google `client secret` in the frontend. Keep it on the backend only.

## Expected backend contract

### `POST /auth/google`

Request body:

```json
{
  "idToken": "GOOGLE_ID_TOKEN"
}
```

Backend responsibilities:

- Verify the Google ID token.
- Check the audience/client ID matches your web client.
- Create or find the local user.
- Return your own app session, either as a JWT in JSON or as an HttpOnly cookie plus user data.

Example response:

```json
{
  "token": "YOUR_APP_JWT",
  "user": {
    "id": "user_123",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "picture": "https://lh3.googleusercontent.com/..."
  }
}
```

### `GET /auth/session`

Optional but recommended when your backend uses cookies.

Example response:

```json
{
  "user": {
    "id": "user_123",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "picture": "https://lh3.googleusercontent.com/..."
  }
}
```

### `POST /auth/logout`

Optional. Clear the backend session or cookie.

### `GET /reviews`

Return a list of reviews:

```json
[
  {
    "id": 1,
    "rating": 5,
    "comment": "Very helpful app.",
    "createdAt": "2026-05-13T09:00:00.000Z",
    "user": {
      "name": "Jane Doe",
      "picture": "https://lh3.googleusercontent.com/..."
    }
  }
]
```

### `POST /reviews`

Require an authenticated app session.

Request body:

```json
{
  "rating": 5,
  "comment": "EyeRoute helped me feel safer walking alone."
}
```

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
