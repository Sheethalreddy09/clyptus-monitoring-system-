export type UserRole = 'TEAM_LEAD' | 'TEAM_MEMBER';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  profile_image?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  assigned_role?: string | null;
}

export interface ProjectMember {
  id: number;
  project_id: number;
  user_id: number;
  assigned_role?: string;
  joined_at: string;
  user?: User;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  team_lead_id: number;
  status: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  team_lead?: User;
  members: ProjectMember[];
  task_count: number;
  completed_task_count: number;
  progress_percentage: number;
}

export interface TaskComment {
  id: number;
  task_id: number;
  user_id: number;
  comment: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface TaskAttachment {
  id: number;
  task_id: number;
  user_id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  created_at: string;
  user?: User;
}

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description?: string;
  assigned_to?: number | null;
  created_by: number;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string | null;
  estimated_hours: number;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  is_overdue: boolean;
  assignee?: User | null;
  creator?: User | null;
  project_name?: string;
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
}

export interface GroupMember {
  id: number;
  group_id: number;
  user_id: number;
  joined_at: string;
  user?: User;
}

export interface Group {
  id: number;
  project_id?: number | null;
  name: string;
  description?: string;
  created_by: number;
  created_at: string;
  members: GroupMember[];
  member_count: number;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  sender?: User;
  receiver?: User;
}

export interface GroupMessage {
  id: number;
  group_id: number;
  sender_id: number;
  message: string;
  created_at: string;
  sender?: User;
}

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  project_id?: number | null;
  user_id: number;
  action: string;
  entity_type: string;
  entity_id?: number | null;
  created_at: string;
  user?: User;
}

export interface MemberProgressItem {
  user_id: number;
  user_name: string;
  user_email: string;
  assigned_role: string;
  total_tasks: number;
  completed_tasks: number;
  progress_percentage: number;
}

export interface LeadDashboardData {
  total_team_members: number;
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  overall_project_progress: number;
  team_member_progress: MemberProgressItem[];
  recent_activity: ActivityLog[];
  recently_completed_tasks: Task[];
  upcoming_deadlines: Task[];
  overdue_tasks_list: Task[];
}

export interface MemberDashboardData {
  welcome_message: string;
  assigned_tasks_count: number;
  completed_tasks_count: number;
  pending_tasks_count: number;
  in_progress_tasks_count: number;
  personal_progress: number;
  todays_tasks: Task[];
  upcoming_deadlines: Task[];
  recent_activity: ActivityLog[];
  unread_notifications_count: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'TASK_DEADLINE' | 'PROJECT_START' | 'PROJECT_END';
  date: string;
  status?: string;
  priority?: string;
  project_name?: string;
}

export interface AnalyticsData {
  has_data: boolean;
  overall_progress: number;
  completed_vs_pending: { completed: number; pending: number };
  tasks_by_status: { TODO: number; IN_PROGRESS: number; REVIEW: number; COMPLETED: number };
  tasks_by_priority: { LOW: number; MEDIUM: number; HIGH: number };
  member_task_distribution: { name: string; task_count: number }[];
  overdue_count: number;
}
