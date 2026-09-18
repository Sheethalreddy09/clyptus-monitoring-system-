# 🚀 Clyptus Monitoring System - Setup & Run Guide

Follow these simple steps to set up and run the **Clyptus Monitoring System** on your local machine.

---

## 📋 Prerequisites

Before starting, ensure you have the following installed on your machine:
- **Python 3.11+**: Check with `python --version`
- **Node.js 18+** & **npm**: Check with `node -v` and `npm -v`

---

## ⚡ Step 1: Start the Backend (FastAPI)

Open Terminal 1:

```powershell
# 1. Navigate to the backend directory
cd C:\Users\hemas\.gemini\antigravity\scratch\project-monitoring-system\backend

# 2. (Optional but recommended) Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Run database migrations
python -m alembic upgrade head

# 5. Start the backend server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

* 🌐 **Backend URL**: `http://localhost:8000`
* 📖 **Swagger API Docs**: `http://localhost:8000/docs`

---

## ⚡ Step 2: Start the Frontend (React + Vite)

Open Terminal 2:

```powershell
# 1. Navigate to the frontend directory
cd C:\Users\hemas\.gemini\antigravity\scratch\project-monitoring-system\frontend

# 2. Install Node modules
npm install

# 3. Start the dev server
npm run dev
```

* 🚀 **Frontend App URL**: `http://localhost:5173`

---

## 🔑 Step 3: First Time Application Login

1. Open your browser and go to `http://localhost:5173`.
2. Click **"Register as Team Lead / Member"**.
3. Create your account:
   - Choose **Team Lead** role to create projects, assign tasks, add team members, and view analytics.
   - Or choose **Team Member** role to view assigned tasks, update status, and chat.
4. Log in and enjoy your **Clyptus Monitoring System**!

---

## 🧪 Step 4: (Optional) Running Automated Tests

To verify backend APIs and lifecycle logic, open a terminal in `backend`:

```powershell
cd C:\Users\hemas\.gemini\antigravity\scratch\project-monitoring-system\backend
python -m pytest tests/ -v
```
