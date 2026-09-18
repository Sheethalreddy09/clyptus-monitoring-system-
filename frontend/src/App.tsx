import { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { DashboardLead } from './pages/DashboardLead';
import { DashboardMember } from './pages/DashboardMember';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { TasksPage } from './pages/TasksPage';
import { MyTasksPage } from './pages/MyTasksPage';
import { TeamMembersPage } from './pages/TeamMembersPage';
import { GroupsPage } from './pages/GroupsPage';
import { ChatPage } from './pages/ChatPage';
import { CalendarPage } from './pages/CalendarPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ActivityPage } from './pages/ActivityPage';
import { NotificationsPage } from './pages/NotificationsPage';

/** Full-screen loading spinner shown while the auth token is being verified. */
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading…</p>
      </div>
    </div>
  );
}

/** Only authenticated users may access the wrapped route. */
function PrivateRoute({ children }: { children: ReactElement }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" replace />;
}

/** Authenticated users are bounced to /dashboard from public pages. */
function PublicRoute({ children }: { children: ReactElement }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

/** Renders the correct dashboard based on user role. */
function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'TEAM_LEAD' ? <DashboardLead /> : <DashboardMember />;
}

export default function App() {
  return (
    <Routes>
      {/* ── Public routes ─────────────────────────────────────────── */}
      <Route path="/login"           element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register"        element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

      {/* ── Protected routes (wrapped in Layout + sidebar) ─────────── */}
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* Shared by both roles */}
        <Route path="/projects"      element={<ProjectsPage />} />
        <Route path="/projects/:id"  element={<ProjectDetailPage />} />
        <Route path="/groups"        element={<GroupsPage />} />
        <Route path="/messages"      element={<ChatPage />} />
        <Route path="/calendar"      element={<CalendarPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* Team Lead only */}
        <Route path="/tasks"     element={<TasksPage />} />
        <Route path="/team"      element={<TeamMembersPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/activity"  element={<ActivityPage />} />

        {/* Team Member only */}
        <Route path="/my-tasks" element={<MyTasksPage />} />
      </Route>

      {/* ── Catch-all ─────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

