import { Interface } from "readline";

export enum Request_For {
  AUTH= 'auth',
  ADMIN = 'admin'
}

export enum API {
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGOUT_DEVICE = 'logout-device',
  LOGOUT_DEVICES = 'logout-devices',
  REGISTER = 'register',
  PROFILE = 'profile',
  DEVICES = 'devices',
  DASHBOARD = 'dashboard',
  CHANGE_PASSWORD = 'change-password'
}

