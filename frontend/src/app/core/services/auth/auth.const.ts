import { Interface } from "readline";

export enum Request_For {
  AUTH= 'auth',
  ADMIN = 'admin'
}

export enum API {
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTER = 'register',
  PROFILE = 'profile',
  DASHBOARD = 'dashboard'
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'editor' | 'teacher' | 'admin';
    status: boolean;
    profilePic?: string;
    createdAt: string;
    updatedAt: string;
}