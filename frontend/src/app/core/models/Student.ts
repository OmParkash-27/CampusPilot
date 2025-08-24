// src/app/core/models/Student.ts
import { User } from './User';

export interface Course {
  course: 'MCA' | 'MBA' | 'BCA' | 'BBA';
  batchYear: number;
  status: 'active' | 'inactive' | 'graduated';
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface Student {
  _id?: string;
  user: string | User;
  rollNo: string;
  enrollmentNo?: string;
  courses: Course[];
  dob?: string | Date;
  gender?: 'Male' | 'Female' | 'Other';
  phone?: string;
  address?: Address;
  guardianName?: string;
  guardianContact?: string;
  photos?: string[];
  createdAt?: string;
  updatedAt?: string;
}
