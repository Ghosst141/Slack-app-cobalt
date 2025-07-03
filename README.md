# Slack Connect App - Slack Messaging & Scheduling

A full-stack web application to connect Slack workspaces, send messages instantly, and schedule future messages to Slack channels.

---

## Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS  
- **Backend:** Node.js + Express + TypeScript  
- **Database:** SQLite (via better-sqlite3)  
- **Deployment:** Vercel (Frontend) | Render (Backend)  

---

## Features

✅ Slack OAuth 2.0 Authentication  
✅ Send messages instantly to Slack channels  
✅ Schedule future messages to Slack channels  
✅ Manage and cancel scheduled messages  
✅ Refresh token handling (assuming Slack provides refresh tokens)  
✅ Full CORS-protected frontend-backend communication  
✅ SQLite database for token and message storage  


---

## Github repos

- **Frontend:** [Frontend Repo](https://github.com/Ghosst141/Slack-APP-frontend) 
- **Backend:** [Backend Repo](https://github.com/Ghosst141/Slack-APP-backend)  


---

## Live Demo

- **Frontend:** [View Frontend](https://slack-app-frontend-t3kq.vercel.app) (Vercel) 
- **Backend:** [View Backend](https://slack-app-backend.onrender.com)  (Render)


---

## 📦 Project Structure

client/              // React frontend

api/                 // Node.js backend

├── db/              // SQLite database logic

├── routes/          // Express routes

├── scheduler/       // Scheduled message logic

├── services/        // Slack API interaction


---


## Setup Instructions (Local Development)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/slack-connect-app.git
cd slack-connect-app
````
### 2. Setup Backend
```bash
cd server
npm install
```

Create a .env file inside the server folder with the following (i provided .env):

```ini

PORT=3000
CORS_ORIGIN=http://localhost:5173
SLACK_CLIENT_ID=your-slack-client-id
SLACK_CLIENT_SECRET=your-slack-client-secret
SLACK_REDIRECT_URI=https://your-ngrok-url/auth/callback
⚠️ The SLACK_REDIRECT_URI must match your Slack App's redirect URL and point to your backend exposed via ngrok (explained below). It is done by url you have to configure yourself for it.
```
Start the backend:
```bash
npm start
```
### 3. Setup Frontend
```bash
cd client
npm install
Create a .env file inside the client folder with:
```
```ini
VITE_API_END=https://your-ngrok-url
```
Start the frontend:
```bash
npm run dev
```

### 4. Expose Backend with Ngrok (For Slack OAuth to work)
Slack requires a public HTTPS URL to redirect after authentication.

Install and run ngrok:

```bash

ngrok http 3000
```
Copy the generated URL (e.g., https://random-string.ngrok.io) and then :

- Replace SLACK_REDIRECT_URI in your backend .env by adding /auth/callback at end of generated URL
- Replace VITE_API_END in your frontend .env
- Update your Slack App settings (explained next)

Restart both frontend and backend after .env changes.

## Slack API Configuration
Go to https://api.slack.com/apps

Click Create New App

- select you slack APP that you created:
   - got to basic information and copy client Id and client seceret in your backend .env

   - go to OAuth & Permissions section (below basic informations find it)

      - Enable token rotation for refresh token

      - Redirect URLs → Add https://your-ngrok-url/auth/callback

      - bot-Scopes:

         - chat:write

         - channels:read

         - groups:read

- Go to your community for which you created slack-app
   - make sure to add your slack app in channels where you want to send messages which is done by manual invites in channel that you have to done by yourself 



---



## Architectural Overview
### Frontend:

- React UI for Slack connection, message sending, scheduling

- Axios for API communication

### Backend:

- Express routes for auth & messaging

- SQLite stores tokens and scheduled messages

- Scheduler runs every minute to check & send pending messages

### Token Management:

- Access and refresh tokens securely stored in SQLite

- Automatic refresh logic if access token expires during message send


---



## Challenges & Learnings


1) Scheduled Messages Not Working After Deployment?
   - Likely reasons:

      - Free hosting platforms (like Render) sleep when idle, pausing the scheduler 

      - SQLite database on free hosting may reset or not persist across restarts

   - Solution for Production:

      - Use a paid hosting plan or dedicated server to prevent sleeping or use render background worker for scheduling

      - Consider a more robust DB like MySQL or MongoDB for persistence

2) Slack OAuth Complexity:
    - Handling redirect URLs with ngrok during development was tricky beacuse in development we get http port for Oauth redirect URL we need https. Careful .env management solved it.

3) Refresh Token Logic:
    - Slack uses refresh tokens for long-term access. Refresh flow implemented in slackServices.ts ensures seamless user experience without repeated login.

4) Scheduling:
    - Currently in our backend we inplement a Scheduler which check database for scheduled messages in every 60 sec. But we need more reliable scheduler.

---


# Author
Om patel
- https://github.com/Ghosst141
- https://www.linkedin.com/in/om-patel-422696179/

