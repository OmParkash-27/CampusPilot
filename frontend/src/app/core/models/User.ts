export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'student' | 'editor' | 'teacher' | 'admin';
    status: boolean;
    profilePic?: string | null | '' | undefined;
    createdAt: string;
    updatedAt: string;
}