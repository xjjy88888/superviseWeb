import React from "react";
import { Router, Route, Switch } from "dva/router";
import Login from "./pages/Login";
import Home from "./pages/Home";
import RegionMap from "./pages/Region/Map/Map";
import Review from "./pages/System/User/Review.js";
import Society from "./pages/System/User/Society.js";
import Admin from "./pages/System/User/Admin.js";
import Role from "./pages/System/User/Role.js";
import District from "./pages/System/District.js";
import Departs from "./pages/System/Departs.js";
import Dict from "./pages/System/Dict.js";
import Branch from "./pages/System/Branch.js";
import Company from "./pages/System/Company.js";
import ProjectList from "./pages/Project/List/List";
import ProjectMap from "./pages/Project/Map/Map";
import CesiumMap from "./pages/Project/Map/CesiumMap";

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
