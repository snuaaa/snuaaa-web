import React, { lazy } from 'react';
import { Route, Switch } from 'react-router-dom';

const SignUp = lazy(() => import('../components/Signup/SignUp'));
const LogIn = lazy(() => import('../components/Login/LogIn'));

function AuthRoutes() {

  return (
    <Switch>
      <Route path="/auth/login" component={LogIn} />
      <Route path="/auth/signup" component={SignUp} />
    </Switch>
  );
}

export default AuthRoutes;
