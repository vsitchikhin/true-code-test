import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { routeConfig } from '@/app/providers/router/config/routeConfig';
import { useUserStore } from '@/entities/user';

export const AppRouter = () => {
  const authData = useUserStore((state) => state.authData);
  const isMounted = useUserStore((state) => state.isMounted);

  if (!isMounted) return null;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {Object.values(routeConfig).map(({ element, path, authOnly, guestOnly }) => {
          let renderedElement = element;

          if (authOnly && !authData) {
            renderedElement = <Navigate to="/login" replace />;
          } else if (guestOnly && authData) {
            renderedElement = <Navigate to="/" replace />;
          }

          return <Route key={path} path={path} element={renderedElement} />;
        })}
      </Routes>
    </Suspense>
  );
};
