import { useEffect } from 'react';
import { AppRouter } from '@/app/providers/router/ui/AppRouter';
import { useUserStore } from '@/entities/user';
import { Header } from '@/widgets/Header';

function App() {
  const initAuth = useUserStore((state) => state.initAuth);
  const authData = useUserStore((state) => state.authData);
  const isMounted = useUserStore((state) => state.isMounted);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <div className="app">
      {isMounted && authData && <Header />}
      <AppRouter />
    </div>
  );
}

export default App;
