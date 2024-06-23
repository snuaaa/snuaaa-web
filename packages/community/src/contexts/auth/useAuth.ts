import { useContext } from 'react';
import { Auth, AuthContext } from './context';

const useAuth = (): Required<Auth> => {
  const context = useContext(AuthContext);
  if (!context.authLogin || !context.authLogout) {
    throw new Error('useAuth can be used within AuthProvider');
  }
  return context as Required<Auth>;
};

export default useAuth;
