# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

# Smart Parking Davao Frontend

A modern web application for managing parking spaces in Davao City.

## API Documentation

The application expects a RESTful API with the following endpoints and data structures.

### Base URL

```
http://localhost:3000/api
```

### Authentication

All endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

### Endpoints

#### Users

##### GET /users
Get all users.

Response:
```json
[
  {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "username": "string",
    "email": "string",
    "role": "user" | "admin",
    "status": "active" | "inactive"
  }
]
```

##### GET /users/:id
Get a single user.

Response:
```json
{
  "id": "string",
  "firstName": "string",
  "lastName": "string",
  "username": "string",
  "email": "string",
  "role": "user" | "admin",
  "status": "active" | "inactive"
}
```

##### POST /users
Create a new user.

Request:
```json
{
  "firstName": "string",
  "lastName": "string",
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "user" | "admin",
  "status": "active" | "inactive"
}
```

##### PATCH /users/:id
Update a user.

Request:
```json
{
  "firstName": "string",
  "lastName": "string",
  "username": "string",
  "email": "string",
  "role": "user" | "admin",
  "status": "active" | "inactive"
}
```

##### DELETE /users/:id
Delete a user.

#### Parking Lots

##### GET /parking-lots
Get all parking lots.

Response:
```json
[
  {
    "id": "string",
    "name": "string",
    "location": {
      "lat": number,
      "lng": number
    },
    "address": "string",
    "totalSpaces": number,
    "availableSpaces": number,
    "status": "active" | "maintenance" | "closed"
  }
]
```

##### GET /parking-lots/:id
Get a single parking lot.

Response:
```json
{
  "id": "string",
  "name": "string",
  "location": {
    "lat": number,
    "lng": number
  },
  "address": "string",
  "totalSpaces": number,
  "availableSpaces": number,
  "status": "active" | "maintenance" | "closed"
}
```

##### POST /parking-lots
Create a new parking lot.

Request:
```json
{
  "name": "string",
  "location": {
    "lat": number,
    "lng": number
  },
  "address": "string",
  "totalSpaces": number,
  "availableSpaces": number,
  "status": "active" | "maintenance" | "closed"
}
```

##### PATCH /parking-lots/:id
Update a parking lot.

Request:
```json
{
  "name": "string",
  "location": {
    "lat": number,
    "lng": number
  },
  "address": "string",
  "totalSpaces": number,
  "availableSpaces": number,
  "status": "active" | "maintenance" | "closed"
}
```

##### DELETE /parking-lots/:id
Delete a parking lot.

#### Reservations

##### GET /reservations
Get all reservations.

Response:
```json
[
  {
    "id": "string",
    "parkingLotId": "string",
    "parkingLotName": "string",
    "userId": "string",
    "userName": "string",
    "vehiclePlate": "string",
    "notes": "string",
    "startTime": "string (ISO date)",
    "endTime": "string (ISO date)",
    "status": "active" | "completed" | "cancelled",
    "createdAt": "string (ISO date)"
  }
]
```

##### GET /reservations/:id
Get a single reservation.

Response:
```json
{
  "id": "string",
  "parkingLotId": "string",
  "parkingLotName": "string",
  "userId": "string",
  "userName": "string",
  "vehiclePlate": "string",
  "notes": "string",
  "startTime": "string (ISO date)",
  "endTime": "string (ISO date)",
  "status": "active" | "completed" | "cancelled",
  "createdAt": "string (ISO date)"
}
```

##### POST /reservations
Create a new reservation.

Request:
```json
{
  "parkingLotId": "string",
  "userId": "string",
  "vehiclePlate": "string",
  "notes": "string",
  "startTime": "string (ISO date)",
  "endTime": "string (ISO date)",
  "status": "active" | "completed" | "cancelled"
}
```

##### PATCH /reservations/:id
Update a reservation.

Request:
```json
{
  "parkingLotId": "string",
  "userId": "string",
  "vehiclePlate": "string",
  "notes": "string",
  "startTime": "string (ISO date)",
  "endTime": "string (ISO date)",
  "status": "active" | "completed" | "cancelled"
}
```

##### DELETE /reservations/:id
Delete a reservation.

#### Reports

##### GET /reports/summary
Get report summary.

Response:
```json
{
  "totalRevenue": number,
  "dailyReservations": number,
  "parkingUtilization": number,
  "averageDuration": number,
  "revenueChange": number,
  "reservationChange": number,
  "utilizationChange": number,
  "durationChange": number
}
```

##### GET /reports/daily-reservations
Get daily reservations data.

Response:
```json
[
  {
    "date": "string (YYYY-MM-DD)",
    "reservations": number
  }
]
```

##### GET /reports/revenue
Get revenue data.

Response:
```json
[
  {
    "date": "string (YYYY-MM-DD)",
    "revenue": number
  }
]
```

##### GET /reports/peak-hours
Get peak hours data.

Response:
```json
[
  {
    "hour": "string (HH:00)",
    "usage": number
  }
]
```

##### GET /reports/user-demographics
Get user demographics data.

Response:
```json
[
  {
    "name": "string",
    "value": number
  }
]
```

## State Management

The application uses React Query for state management of API data. Each service has its own set of queries and mutations:

### Users
- Query key: `['users']`
- Mutations: create, update, delete

### Parking Lots
- Query key: `['parkingLots']`
- Mutations: create, update, delete

### Reservations
- Query key: `['reservations']`
- Mutations: create, update, delete

### Reports
- Query keys: 
  - `['reports', 'summary']`
  - `['reports', 'daily-reservations']`
  - `['reports', 'revenue']`
  - `['reports', 'peak-hours']`
  - `['reports', 'user-demographics']`

## Error Handling

The API should return appropriate HTTP status codes and error messages:

- 200: Success
- 201: Created
- 204: No Content (for successful deletions)
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Error response format:
```json
{
  "error": {
    "message": "string",
    "code": "string",
    "details": object
  }
}
```

## Authentication

The application uses JWT tokens for authentication. The API should provide:

1. Login endpoint (`POST /auth/login`):
```json
{
  "username": "string",
  "password": "string"
}
```

Response:
```json
{
  "access": "string (JWT token)",
  "refresh": "string (refresh token)"
}
```

2. Token refresh endpoint (`POST /auth/refresh`):
```json
{
  "refresh": "string (refresh token)"
}
```

Response:
```json
{
  "access": "string (new JWT token)"
}
```

## Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Environment Variables

Create a `.env` file with the following variables:

```
VITE_API_URL=http://localhost:3000/api
VITE_TEST_MODE=true
```
