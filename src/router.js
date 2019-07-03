import React from "react";
import { Router, Route, Switch } from "dva/router";
import Login from "./routes/User/Login";
import HomePage from "./routes/HomePage";
import System from "./routes/System";
import ProjectSupervision from "./routes/ProjectSupervision";
import Integration from "./routes/RegionalSupervision/Integration";
import SplitScreen from "./routes/RegionalSupervision/SplitScreen";

function RouterConfig({ history }) {
  return (
    <Router history={history}>
      <Switch>
        <Route path="/" exact component={Login} />
        <Route path="/user/login" exact component={Login} />
        <Route path="/homePage" exact component={HomePage} />
        <Route path="/system" exact component={System} />
        <Route
          path="/projectSupervision"
          exact
          component={ProjectSupervision}
        />
        <Route
          path="/regionalSupervision/integration"
          exact
          component={Integration}
        />
        <Route
          path="/regionalSupervision/splitScreen"
          exact
          component={SplitScreen}
        />
      </Switch>
    </Router>
  );
}

export default RouterConfig;
