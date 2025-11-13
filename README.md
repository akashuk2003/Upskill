Welcome to the Developer Upskill Platform, a full-stack web application designed for developers to create, share, and track their learning journeys. This platform allows users to build structured learning paths, add resources, and engage with a community, all while earning XP and badges.

The UI is inspired by modern, tech-focused platforms and features a "pixel-fusion" dark mode theme.

![]

## Features
This platform is a complete Minimal Viable Product (MVP) with a rich feature set for both learners and creators.

🧑‍🎓 Learner Features
Skill Enrollment: Users can browse and enroll in public skills and learning paths.

Personalized Homepage: The dashboard shows "My Current Skills" (in-progress) separately from new "Explore Skills."

Structured Learning: Learning Paths feature "skill locking," requiring users to complete prerequisites before moving on.

Gamification:

XP System: Earn experience points for completing lessons.

Global Leaderboard: Compete with other users for the top spot.

Badges: Earn unique badges for completing skills.

Community:

Comments & Replies: A fully threaded discussion board on each skill page.

Reviews & Ratings: Leave a 1-5 star rating and a review after completing a skill.

Profile Management: Users can update their name, bio, and avatar on their My Profile page.

Global Search: A powerful search bar to find skills and paths.

🧑‍🏫 Creator Features
Creator Studio:

Skill Creation: A dedicated "My Skills" dashboard to create, edit, and manage skills.

Path Creation: A "My Paths" dashboard to create, edit, and manage learning paths.

Module System: Creators can structure their skills by adding "Module Titles" to resources (e.g., "Module 1: Basics," "Module 2: Advanced").

Skill Forking: Users can "fork" any public skill, creating a private, editable copy in their own dashboard to add personal notes.

Content Management: Creators can add/remove/edit resources and lessons from their skills and paths.

🎨 UI/UX
Pixel-Fusion Theme: A "Codedex-style" dark mode UI with a pixel font for headings and a clean sans-serif for body text.

Interactive UI: Features include a typing-animation search bar and an interactive GridScan WebGL background on the login page.

Fully Responsive: A mobile-friendly design with a hamburger menu for navigation.

## Tech Stack
This project is built with a modern, decoupled architecture.

Backend:

Python

Django & Django Rest Framework (DRF) for the API

PostgreSQL (for production, db.sqlite3 for development)

Simple JWT for token-based authentication

Frontend:

React (with Hooks & Context API)

React Router for page navigation

Tailwind CSS for all styling

Axios for API requests

Three.js & face-api.js for the interactive login background

## 🚀 Setup and Installation
To run this project locally, you'll need to run the backend (Django) and frontend (React) servers simultaneously.

1. Backend Setup (Django)
Clone the repository:

Bash

git clone [https://github.com/your-username/your-repo-name.git](https://github.com/akashuk2003/Upskill.git)
cd developer_upskill
Create and activate a virtual environment:

Bash

# Windows
python -m venv .venv
.\.venv\Scripts\activate

# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate
Install dependencies: (You will need to create a requirements.txt file first: pip freeze > requirements.txt)

Bash

pip install -r requirements.txt
Run database migrations:

Bash

python manage.py makemigrations
python manage.py migrate
Create a superuser (to access the admin panel):

Bash

python manage.py createsuperuser
Run the server:

Bash

python manage.py runserver
The backend API will be running at http://127.0.0.1:8000.

2. Frontend Setup (React)
Navigate to the frontend folder in a new terminal window:

Bash

cd developer-upskill-frontend
Install npm packages:

Bash

npm install
Install missing packages for the WebGL background:

Bash

npm install three postprocessing face-api.js
Run the app:

Bash

npm start
The React development server will open at http://localhost:3000.
