
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type TaskStatus = 'todo' | 'progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  unit: string;
  assignees: string[];
  startDate: string;
  endDate: string;
  status: TaskStatus;
  createdBy: string;
  observations?: string;
  createdAt: string;
}
