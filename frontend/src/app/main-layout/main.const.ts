
//simple users sidebar data
import { MenuItem } from 'primeng/api';

export interface RoleMenuItem extends MenuItem {
  roles?: string[];
  showWhenLoggedIn?: boolean;
  public?: boolean;
  items?: RoleMenuItem[]
}

export const dashboardLabels: Record<string, string> = {
  eDashboard: 'Editor Dashboard',
  tDashboard: 'Teacher Dashboard',
  sDashboard: 'Student Dashboard'
};

export const sidebarMenuItems: RoleMenuItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: 'pi pi-home',
    routerLink: '/',
    visible: false,
    public: true,
    showWhenLoggedIn: true,
    roles: []
  },
  

  // Admin menu
  {
    id: 'aDashboard',
    label: 'Dashboard',
    icon: 'pi pi-microsoft',
    routerLink: '/admin/dashboard',
    visible: false,
    public: false,
    showWhenLoggedIn: true,
    roles: ['admin'],
  },

  {
    id: 'users',
    label: 'Users',
    icon: 'pi pi-users',
    roles: ['admin'],
    visible: false,
    public: false,
    showWhenLoggedIn: true,
    items: [
      { id: 'create-user', label: 'Create', icon: 'pi pi-user-plus', routerLink: '/admin/user-add-edit',visible:false, public:false, showWhenLoggedIn: true, roles: ['admin'] },
      { id: 'list-users', label: 'List', icon: 'pi pi-list', routerLink: '/admin/user-list', visible:false, public:false, showWhenLoggedIn: true, roles: ['admin'] }
    ]    
  },
  
  // Editor menu
  {
    id: 'eDashboard',
    label: 'Dashboard',
    icon: 'pi pi-microsoft',
    routerLink: '/editor/dashboard',
    visible: false,
    public:false,
    showWhenLoggedIn: true,
    roles: ['admin', 'editor'],
  },
  // Teacher menu
  {
    id: 'tDashboard',
    label: 'Dashboard',
    icon: 'pi pi-microsoft',
    routerLink: '/teacher/dashboard',
    visible: false,
    public: false,
    showWhenLoggedIn: true,
    roles: ['admin', 'teacher'],
  },
  {
    id: 'students',
    label: 'Students',
    icon: 'pi pi-graduation-cap',
    visible: false,
    public: false,
    showWhenLoggedIn: true,
    roles: ['admin', 'editor', 'teacher'],
    items: [
      { id: 'create-student', label: 'Create', icon: 'pi pi-plus', routerLink: '/common/student-add-edit', visible:false, public:false, showWhenLoggedIn: true, roles: ['admin', 'editor', 'teacher'] },
      { id: 'list-students', label: 'List', icon: 'pi pi-list', routerLink: '/common/student-list', visible:false, public:false, showWhenLoggedIn: true, roles: ['admin', 'editor', 'teacher'] },
      { id: 'new-registered', label: 'New Registered', icon: 'pi pi-list', routerLink: '/common/student-new-register-list', visible:false, public:false, showWhenLoggedIn: true, roles: ['admin', 'editor', 'teacher'] },
    ]
  },
  // Students Dashboard
  {
    id: 'sDashboard',
    label: 'Dashboard',
    icon: 'pi pi-microsoft',
    routerLink: '/student/dashboard',
    visible: false,
    public: false,
    showWhenLoggedIn: true,
    roles: ['admin', 'student'],
  },
  {
    id: 'uploadFiles',
    label: 'Upload Files',
    icon: 'pi pi-file',
    routerLink: '/student/upload-files',
    visible: false,
    public: false,
    showWhenLoggedIn: true,
    roles: ['student'],
  },
  
  {
    id: 'about',
    label: 'About',
    icon: 'pi pi-info-circle',
    routerLink: '/about',
    visible: false,
    public: true,
    showWhenLoggedIn: true,
    roles: []
  },
  {
    id: 'contact',
    label: 'Contact',
    icon: 'pi pi-envelope',
    routerLink: '/contact',
    visible: false,
    public: true,
    showWhenLoggedIn: true,
    roles: []
  },
  {
    id: 'login',
    label: 'Login',
    icon: 'pi pi-sign-in',
    routerLink: '/login',
    queryParams: { mode: 'login' },
    visible: false,
    public: true,
    showWhenLoggedIn: false,
    roles: []
  },
  {
    id: 'register',
    label: 'Register',
    icon: 'pi pi-user-plus',
    routerLink: '/login',
    queryParams: { mode: 'register' },
    visible: false,
    public: true,
    showWhenLoggedIn: false,
    roles: []
  },
  {
    id: 'logout', 
    label: 'Logout',
    icon: 'pi pi-sign-out',
    visible: false,
    public: false,
    showWhenLoggedIn: true,
    roles: []
  }
  
];
