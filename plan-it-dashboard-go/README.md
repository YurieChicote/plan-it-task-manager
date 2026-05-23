# Plan-It: Project & Task Management System
**Course:** IPT Project

## Project Description
A full-stack task management application designed to help teams organize projects, track task progress, and manage collaborators. This project features a React-based frontend and a Node.js/Express backend connected to a MongoDB database.

## Core Features
*   **User Authentication:** Secure Login and Registration using JWT (JSON Web Tokens) and bcrypt password hashing.
*   **Project Management:** Create, Update, and Delete projects with specific deadlines.
*   **Task Tracking:** Assign tasks to specific projects and track status (Pending, In Progress, Completed).
*   **Role-based Access:** Management-only routes for sensitive actions.

## Tech Stack
*   **Frontend:** React.js, Vite, Tailwind CSS, Shadcn/UI
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB
*   **Auth:** JWT & Bcrypt

## Setup Instructions
1.  **Backend:** Navigate to `/backend`, run `npm install`, then `node server.js`.
2.  **Frontend:** Navigate to `/plan-it-dashboard-go`, run `npm install`, then `npm run dev`.
3.  Ensure your `.env` file has the correct `MONGO_URI`.
