import { User } from 'types';

interface AuthType {
  isLoggedIn: boolean;
  user: User;
}

export default AuthType;
