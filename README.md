# Developer Upskill Platform

Welcome to the **Developer Upskill Platform**, a full‑stack web application for developers to **create**, **share**, and **track** their learning journeys. Build structured learning paths, add modular lessons, earn XP, unlock badges, and join a growing community.

The UI is inspired by modern tech‑centric platforms like **Codedex**, featuring:

* Pixel‑fusion dark mode theme
* Interactive WebGL backgrounds
* Fully responsive design

---

## ✨ Key Features

A complete, feature‑rich platform for both learners and creators.

---

## 🧑‍🎓 Learner Features

* **Skill Enrollment:** Browse and enroll in public skills and learning paths.
* **Personalized Homepage:** Shows "My Current Skills" (with progress bars) and "Explore Skills".
* **Structured Learning:** Learning Paths enforce prerequisites (e.g., complete "Learn Python" before unlocking "Learn Django").

### Gamification

* **XP System:** Earn XP for completing lessons.
* **Global Leaderboard:** Compete with other learners.
* **Badges:** Unlock unique badges.

### Community

* **Comments & Replies:** Fully threaded discussion on each skill.
* **Reviews & Ratings:** Leave 1–5 star ratings with reviews after completing a skill.
* **Profile Management:** Update name, bio, avatar.
* **Skill Forking:** Fork any public skill into a private, editable copy for notes and personal tweaks.

---

## 🧑‍🏫 Creator Features

### Creator Studio

* **Skill Creation:** Manage skills with titles, descriptions, visibility (public/private).
* **Path Creation:** Create learning paths with drag‑and‑drop ordering.

### Structured Content

* **Modules:** Organize resources into clear "chapters".
* **Resource Management:** Add/edit/delete articles, videos, etc.
* **Path Management:** Easily reorder skills in a learning path.
* **Global Search:** Powerful `/api/search/` endpoint.

---

## 🎨 UI / UX

* **Pixel-Fusion Dark Theme:** Pixel‑style headings, clean sans‑serif body text.
* **Interactive Login:** GridScan WebGL background using Three.js with mouse‑reactive effects.
* **Responsive Design:** Mobile‑friendly with a smooth hamburger menu.

---

## 💻 Tech Stack

### Backend (Django)

* Python 3
* Django & DRF
* PostgreSQL (prod) / SQLite (dev)
* Simple JWT for authentication

### Frontend (React)

* React (Hooks + Context API)
* React Router
* Tailwind CSS
* Axios with auth interceptors

---

## 🚀 Setup and Installation

Run backend (Django) and frontend (React) simultaneously.

---

# 1. Backend Setup (Django)

### Clone the repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name/backend-folder
```

### Create and activate virtual environment

#### Windows

```bash
python -m venv .venv
.\.venv\Scripts\activate
```

#### macOS / Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### Create `requirements.txt`

```bash
pip freeze > requirements.txt
```

### Install dependencies

```bash
pip install -r requirements.txt
```

### Run migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### Create superuser

```bash
python manage.py createsuperuser
```

### Run backend server

```bash
python manage.py runserver
```

Backend runs at: **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

---

# 2. Frontend Setup (React)

### Navigate to the frontend folder

```bash
cd ../frontend-folder
```

### Install npm packages

```bash
npm install
```


### Run React development server

```bash
npm start
```

Frontend runs at: **[http://localhost:3000](http://localhost:3000)**

---

