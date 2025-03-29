import { User } from '~/services/types';

interface AuthType {
  isLoggedIn: boolean;
  user: User;
}

export default AuthType;
