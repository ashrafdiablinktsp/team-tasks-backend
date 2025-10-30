export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssignedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  position?: string;
  jobDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskWithUser extends Task {
  assignedToUser?: AssignedUser;
}

export interface TaskWithUserRow {
  id: string;
  title: string;
  description: string | null;
  status: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  user_role: string | null;
  user_position: string | null;
  user_jobDescription: string | null;
  user_createdAt: string | null;
  user_updatedAt: string | null;
}
