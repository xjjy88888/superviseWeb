import React from "react";
import { Router, Route, Switch } from "dva/router";
import HomePage from "./routes/HomePage";
import Integration from "./routes/RegionalSupervision/Integration";
import SplitScreen from "./routes/RegionalSupervision/SplitScreen";
import ProjectSupervision from "./routes/ProjectSupervision";
import Login from "./routes/User/Login";

function RouterConfig({ history }) {
  return (
    <Router history={history}>
      <Switch>
        <Route path="/" exact component={Login} />
        <Route path="/homePage" exact component={HomePage} />
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
        <Route
          path="/projectSupervision"
          exact
          component={ProjectSupervision}
        />
        <Route path="/user/login" exact component={Login} />
      </Switch>
    </Router>
  );
}

export default RouterConfig;
