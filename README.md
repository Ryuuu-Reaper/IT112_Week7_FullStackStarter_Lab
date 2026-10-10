# IT112 Week 7 Server-Side Development Activity

An IT112 Week 7 user CRUD activity built with Express, MongoDB/Mongoose, and a Bootstrap-assisted vanilla JavaScript frontend.

## Requirements

- Node.js LTS
- A MongoDB Atlas database and database user

## Local setup

1. Install packages with `npm install`.
2. Create a root `.env` file based on `.env.example`.
3. Put your own Atlas connection string in `MONGO_URI`. Keep `.env` private; it is ignored by Git.
4. Start the development server with `npm run dev`.
5. Open `http://localhost:3000`.

The API provides `GET`, `POST`, `PUT`, and `DELETE` at `/api/users`, plus `/api/health`.

## Render

Create a new Web Service connected to this repository. Use `npm install` as the build command and `npm start` as the start command. Add `MONGO_URI` in the Render service's environment settings. Render supplies `PORT` automatically. Check that your Atlas network access allows the deployed service to connect.
