import React from "react";
import { Route, Switch, withRouter } from "react-router-dom";
import Home from "./components/home";
import Play from "./components/play";

const App = () => {
  return (
    <>
      <Switch>
        <Route exact={true} path='/' component={Home} />
        <Route path='/play/' component={Play} />
      </Switch>
    </>
  );
}

export default withRouter(App);