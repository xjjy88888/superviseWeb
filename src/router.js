import React from "react";
import { Router, Route, Switch } from "dva/router";
import Login from "./routes/Login";
import HomePage from "./routes/HomePage";
import ProjectList from "./routes/Project/List";
import ProjectMap from "./routes/Project/Map";
import RegionMap from "./routes/Region/Map/Map";
import Contrast from "./routes/Region/Contrast";
import Review from "./routes/System/User/Review";
import Society from "./routes/System/User/Society";
import Account from "./routes/System/User/Administrative/Account";
import Role from "./routes/System/User/Administrative/Role";
import District from "./routes/System/District";
import Dict from "./routes/System/Dict";
import Branch from "./routes/System/Branch";
import Company from "./routes/System/Company";

function RouterConfig({ history }) {
  return (
    <Router history={history}>
      <Switch>
        <Route path="/" exact component={Login} />
        <Route path="/login" exact component={Login} />
        <Route path="/index" exact component={HomePage} />
        <Route path="/region/map" exact component={RegionMap} />
        <Route path="/region/contrast" exact component={Contrast} />
        <Route path="/project/list" exact component={ProjectList} />
        <Route path="/project/map" exact component={ProjectMap} />
        <Route path="/system" exact component={Review} />
        <Route path="/system/user/review" component={Review} exact />
        <Route path="/system/user/society" component={Society} exact />
        <Route
          path="/system/user/administrative/account"
          component={Account}
          exact
        />
        <Route path="/system/user/administrative/role" component={Role} exact />
        <Route path="/system/dict" component={Dict} exact />
        <Route path="/system/company" component={Company} exact />
        <Route path="/system/district" component={District} exact />
        <Route path="/system/branch" component={Branch} exact />
      </Switch>
    </Router>
  );
}

export default RouterConfig;
