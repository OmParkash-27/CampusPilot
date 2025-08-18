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