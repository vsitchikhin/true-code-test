import { useEffect } from 'react';
import { AppRouter } from '@/app/providers/router/ui/AppRouter';
import { useUserStore } from '@/entities/user';

function App() {
  const initAuth = useUserStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <div className="app">
      <AppRouter />
    </div>
  );
}

export default App;
