import type { RouteProps } from 'react-router-dom';
import { RegisterPage } from '@/pages/Register';
import { LoginPage } from '@/pages/Login';
import { HomePage } from '@/pages/Home';
import { ProfilePage } from '@/pages/Profile';

export type AppRoutesProps = RouteProps & {
  authOnly?: boolean;
  guestOnly?: boolean;
};

export const AppRoutes = {
  HOME: 'home',
  LOGIN: 'login',
  REGISTER: 'register',
  PROFILE: 'profile',
  MY_PROFILE: 'my_profile',
  NOT_FOUND: 'not_found',
} as const;

export type AppRoutesType = (typeof AppRoutes)[keyof typeof AppRoutes];

export const RoutePath: Record<AppRoutesType, string> = {
  [AppRoutes.HOME]: '/',
  [AppRoutes.LOGIN]: '/login',
  [AppRoutes.REGISTER]: '/register',
  [AppRoutes.PROFILE]: '/user/:username',
  [AppRoutes.MY_PROFILE]: '/user/me',
  [AppRoutes.NOT_FOUND]: '*',
};

export const routeConfig: Record<AppRoutesType, AppRoutesProps> = {
  [AppRoutes.HOME]: {
    path: RoutePath[AppRoutes.HOME],
    element: <HomePage />,
    authOnly: true,
  },
  [AppRoutes.LOGIN]: {
    path: RoutePath[AppRoutes.LOGIN],
    element: <LoginPage />,
    guestOnly: true,
  },
  [AppRoutes.REGISTER]: {
    path: RoutePath[AppRoutes.REGISTER],
    element: <RegisterPage />,
    guestOnly: true,
  },
  [AppRoutes.PROFILE]: {
    path: RoutePath[AppRoutes.PROFILE],
    element: <ProfilePage />,
    authOnly: true,
  },
  [AppRoutes.MY_PROFILE]: {
    path: RoutePath[AppRoutes.MY_PROFILE],
    element: <ProfilePage />,
    authOnly: true,
  },
  [AppRoutes.NOT_FOUND]: {
    path: RoutePath[AppRoutes.NOT_FOUND],
    element: <div>404 - Not Found</div>,
  },
};
