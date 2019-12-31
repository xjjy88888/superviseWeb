import React from "react";
import { Router, Route, Switch } from "dva/router";
import Login from "./routes/Login";
import Home from "./routes/Home";
import RegionMap from "./routes/Region/Map/Map";
import Review from "./routes/System/User/Review.js";
import Society from "./routes/System/User/Society.js";
import Admin from "./routes/System/User/Admin.js";
import Role from "./routes/System/User/Role.js";
import District from "./routes/System/District.js";
import Departs from "./routes/System/Departs.js";
import Dict from "./routes/System/Dict.js";
import Branch from "./routes/System/Branch.js";
import Company from "./routes/System/Company.js";
import ProjectList from "./routes/Project/List/List";
import ProjectMap from "./routes/Project/Map/Map";
import CesiumMap from "./routes/Project/Map/CesiumMap";

function RouterConfig({ history }) {
  return (
    <Router history={history}>
      <Switch>
        <Route path="/login" exact component={Login} />
        <Route path="/index" exact component={Home} />
        <Route path="/region" exact component={RegionMap} />
        <Route path="/system" exact component={Review} />
        <Route path="/system/user/review" component={Review} exact />
        <Route path="/system/user/society" component={Society} exact />
        <Route path="/system/user/admin" component={Admin} exact />
        <Route path="/system/user/role" component={Role} exact />
        <Route path="/system/dict" component={Dict} exact />
        <Route path="/system/company" component={Company} exact />
        <Route path="/system/district" component={District} exact />
        <Route path="/system/departs" component={Departs} exact />
        <Route path="/system/branch" component={Branch} exact />
        {/* <Route path="/project" exact component={ProjectList} /> */}
        <Route path="/project/list" exact component={ProjectList} />
        <Route path="/project/map" exact component={ProjectMap} />
        <Route path="/project/cesiummap" exact component={CesiumMap} />
        <Route path="/" component={Login} />
      </Switch>
    </Router>
  );
}

export default RouterConfig;
