
//simple users sidebar data
import { MenuItem } from 'primeng/api';

export interface RoleMenuItem extends MenuItem {
  roles?: string[];
  showWhenLoggedIn?: boolean;
  public?: boolean;
  items?: RoleMenuItem[]
}
export const sidebarMenuItems: RoleMenuItem[] = [
  {
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
    label: 'Dashboard',
    icon: 'pi pi-microsoft',
    routerLink: '/admin/dashboard',
    visible: false,
    public: false,
    showWhenLoggedIn: true,
    roles: ['admin'],
  },

  {
    label: 'Users',
    icon: 'pi pi-users',
    roles: ['admin'],
    visible: false,
    public: false,
    showWhenLoggedIn: true,
    items: [
      { label: 'Register User', icon: 'pi pi-user-plus', routerLink: '/admin/user-add-edit',visible:false, public:false, showWhenLoggedIn: true, roles: ['admin'] },
      { label: 'List Users', icon: 'pi pi-list', routerLink: '/admin/user-list', visible:false, public:false, showWhenLoggedIn: true, roles: ['admin'] }
    ]
  },
  {
    label: 'Students',
    icon: 'pi pi-graduation-cap',
    visible: false,
    public: false,
    showWhenLoggedIn: true,
    roles: ['admin', 'editor', 'teacher'],
    items: [
      { label: 'Create Student', icon: 'pi pi-plus', routerLink: '/common/student-add-edit', visible:false, public:false, showWhenLoggedIn: true, roles: ['admin', 'editor', 'teacher'] },
      { label: 'List Students', icon: 'pi pi-list', routerLink: '/common/student-list', visible:false, public:false, showWhenLoggedIn: true, roles: ['admin', 'editor', 'teacher'] },
      { label: 'New Register Students', icon: 'pi pi-list', routerLink: '/common/student-new-register-list', visible:false, public:false, showWhenLoggedIn: true, roles: ['admin', 'editor', 'teacher'] },
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
    label: 'About',
    icon: 'pi pi-info-circle',
    routerLink: '/about',
    visible: false,
    public: true,
    showWhenLoggedIn: true,
    roles: []
  },
  {
    label: 'Contact',
    icon: 'pi pi-envelope',
    routerLink: '/contact',
    visible: false,
    public: true,
    showWhenLoggedIn: true,
    roles: []
  },
  {
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
    label: 'Logout',
    id: 'logout',
    icon: 'pi pi-sign-out',
    visible: false,
    public: false,
    showWhenLoggedIn: true,
    roles: []
  }
  
];
