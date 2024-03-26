import { lazy } from 'react';
import { Route, Switch } from 'react-router-dom';

const SignUp = lazy(() => import('pages/SignUp'));
const LogIn = lazy(() => import('pages/LogIn'));

function AuthRoutes() {
  return (
    <Switch>
      <Route path="/auth/login" component={LogIn} />
      <Route path="/auth/signup" component={SignUp} />
    </Switch>
  );
}

export default AuthRoutes;
