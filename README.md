# Clyptus Monitoring System

A modern, full-stack project and team monitoring web application built with **FastAPI** and **React + TypeScript + Vite**. The platform streamlines collaboration between **Team Leads** and **Team Members**, featuring project tracking, task workflows, direct and group messaging, activity audit logs, and an interactive calendar schedule.

---

## 🚀 Features

### 👑 Team Lead Workspace
- **Project Management**: Create, view, update, and track projects and milestones.
- **Task Management**: Create tasks, set priorities (`LOW`, `MEDIUM`, `HIGH`), assign deadlines, and review member progress.
- **Team Management**: Onboard and manage team members, assign project roles, and toggle account activation status.
- **Activity Feed**: Real-time audit trail of actions, separated by individual team members with filterable tabs and user sections.
- **Progress & Analytics**: Live completion metrics, task distribution charts, and overdue tracking.

### 👤 Team Member Workspace
- **Personal Dashboard**: View daily tasks, completion rate, upcoming deadlines, and notifications.
- **Task Workflow**: Move assigned tasks between `TODO`, `IN_PROGRESS`, and `REVIEW`.
- **Comments & Collaboration**: Comment on tasks and coordinate with the team.

### 💬 Communication & Schedule
- **Direct & Group Chat**: 1-on-1 direct messaging and group channels with accurate local time timestamps.
- **Project Calendar**: Timeline schedule with a date & time picker filter to search and track milestones and deadlines.
- **Notifications**: Instant system alerts for task assignments, status updates, and new messages.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Bundler & Dev Server**: Vite
- **Styling**: Tailwind CSS & Lucide Icons
- **Routing & State**: React Router v6 & React Context API
- **HTTP Client**: Axios with JWT interceptors

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: SQLite with SQLAlchemy ORM
- **Database Migrations**: Alembic
- **Authentication**: OAuth2 Password Flow with JWT tokens & bcrypt password hashing
- **Testing**: Pytest with HTTPX TestClient

---

## 📁 Project Structure

```text
clyptus-monitoring-system/
├── backend/
│   ├── alembic/                # Database migrations
│   ├── app/
│   │   ├── api/v1/             # REST API routers (auth, projects, tasks, chat, etc.)
│   │   ├── core/               # App config, database session, security
│   │   ├── models/             # SQLAlchemy database models
│   │   ├── schemas/            # Pydantic validation schemas
│   │   └── services/           # Business logic services
│   ├── tests/                  # Automated API test suite
│   ├── project_monitoring.db   # SQLite database
│   └── requirements.txt        # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI, layout, chat, modal components
│   │   ├── context/            # AuthContext and state management
│   │   ├── pages/              # Dashboard, Tasks, Projects, Calendar, Chat, etc.
│   │   ├── services/           # Axios API service
│   │   └── types/              # TypeScript definitions
│   ├── package.json            # Node dependencies
│   └── vite.config.ts          # Vite configuration
│
└── README.md                   # Project documentation
```

---

## ⚡ Getting Started

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** & **npm 9+**

---

### 1. Backend Setup

Open a terminal and navigate to the `backend` folder:

```bash
cd backend
```

1. **(Optional) Create and activate a virtual environment:**
   - **Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run database migrations:**
   ```bash
   alembic upgrade head
   ```

4. **Start the FastAPI backend server:**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

- 🌐 Backend API: [http://localhost:8000](http://localhost:8000)
- 📖 Interactive Swagger API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 2. Frontend Setup

Open a new terminal and navigate to the `frontend` folder:

```bash
cd frontend
```

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the Vite development server:**
   ```bash
   npm run dev
   ```

- 🚀 Web Application: [http://localhost:5173](http://localhost:5173)

---

## 🔑 Default Roles & Authentication

1. **Team Lead Registration**:
   - Go to [http://localhost:5173/login](http://localhost:5173/login)
   - Click **Register as Team Lead** to create your workspace administrator account.
2. **Team Members**:
   - Team Leads can add team members directly from the **Team Members** page in the application.
3. **Password Security**:
   - The login form includes a password visibility toggle (eye icon) to view or hide typed credentials.

---

## 🧪 Running Tests

To run the automated backend test suite:

```bash
cd backend
pytest
```

To build and check frontend types:

```bash
cd frontend
npm run build
```

---

## 📄 License
This project is developed for internal organization and monitoring workflows.
