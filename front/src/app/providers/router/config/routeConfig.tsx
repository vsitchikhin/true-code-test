import type { RouteProps } from 'react-router-dom';
import { RegisterPage } from '@/pages/Register';
import { LoginPage } from '@/pages/Login';
import { PageLayout } from '@/shared/ui';

export type AppRoutesProps = RouteProps & {
  authOnly?: boolean;
  guestOnly?: boolean;
};

export const AppRoutes = {
  HOME: 'home',
  LOGIN: 'login',
  REGISTER: 'register',
  NOT_FOUND: 'not_found',
} as const;

export type AppRoutesType = (typeof AppRoutes)[keyof typeof AppRoutes];

export const RoutePath: Record<AppRoutesType, string> = {
  [AppRoutes.HOME]: '/',
  [AppRoutes.LOGIN]: '/login',
  [AppRoutes.REGISTER]: '/register',
  [AppRoutes.NOT_FOUND]: '*',
};

export const routeConfig: Record<AppRoutesType, AppRoutesProps> = {
  [AppRoutes.HOME]: {
    path: RoutePath[AppRoutes.HOME],
    element: <PageLayout>Home Page (Coming Soon)</PageLayout>,
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
  [AppRoutes.NOT_FOUND]: {
    path: RoutePath[AppRoutes.NOT_FOUND],
    element: <div>404 - Not Found</div>,
  },
};
