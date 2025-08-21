import { User } from './User';

export interface Student {
  _id?: string;            // MongoDB document ID
  user: User | string;     // Linked User (ObjectId ya populated User object)
  enrollmentNo: string;    // Roll number / enrollment
  course: string;          // Example: BCA, MCA
  year: number;            // Example: 1, 2, 3
  section?: string;        // Optional: class section
  admissionDate?: Date;    // Optional: admission date
  isActive?: boolean;      // Default true/false
  createdAt?: Date;
  updatedAt?: Date;
}
