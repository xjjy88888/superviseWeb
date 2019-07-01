import React from "react";
import { Router, Route, Switch } from "dva/router";
import Welcome from "./routes/Home/Welcome";
import Integrat from "./routes/RegionRegulatory/Integrat";
import SplitScreen from "./routes/RegionRegulatory/SplitScreen";
import ProjectRegulatory1 from "./routes/ProjectRegulatory/ProjectRegulatory1";
import Login from "./routes/User/Login";

function RouterConfig({ history }) {
  return (
    <Router history={history}>
      <Switch>
        <Route path="/" exact component={Login} />
        <Route path="/home/welcome" exact component={Welcome} />
        <Route path="/regionRegulatory/integrat" exact component={Integrat} />
        <Route
          path="/regionRegulatory/splitScreen"
          exact
          component={SplitScreen}
        />
        <Route
          path="/projectRegulatory/projectRegulatory1"
          exact
          component={ProjectRegulatory1}
        />
        <Route path="/user/login" exact component={Login} />
      </Switch>
    </Router>
  );
}

export default RouterConfig;
