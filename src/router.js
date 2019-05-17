import React from "react";
import { Router, Route, Switch } from "dva/router";
// import IndexPage from "./routes/IndexPage";
import Welcome from "./routes/Home/Welcome";
import Home2 from "./routes/Home/Home2";
import Integrat from "./routes/RegionRegulatory/Integrat";
import RegionRegulatory2 from "./routes/RegionRegulatory/RegionRegulatory2";
import ProjectRegulatory1 from "./routes/ProjectRegulatory/ProjectRegulatory1";
import ProjectRegulatory2 from "./routes/ProjectRegulatory/ProjectRegulatory2";
import Accountability1 from "./routes/Accountability/Accountability1";
import Accountability2 from "./routes/Accountability/Accountability2";
import Assess1 from "./routes/Assess/Assess1";
import Assess2 from "./routes/Assess/Assess2";
import Login from "./routes/User/Login";

function RouterConfig({ history }) {
  return (
    <Router history={history}>
      <Switch>
        <Route path="/" exact component={Login} />
        <Route path="/home/welcome" exact component={Welcome} />
        <Route path="/home/home2" exact component={Home2} />
        <Route path="/regionRegulatory/integrat" exact component={Integrat} />
        <Route path="/regionRegulatory/regionRegulatory2" exact component={RegionRegulatory2} />
        <Route path="/projectRegulatory/projectRegulatory1" exact component={ProjectRegulatory1} />
        <Route path="/projectRegulatory/projectRegulatory2" exact component={ProjectRegulatory2} />
        <Route path="/accountability/accountability1" exact component={Accountability1} />
        <Route path="/accountability/accountability2" exact component={Accountability2} />
        <Route path="/assess/assess1" exact component={Assess1} />
        <Route path="/assess/assess2" exact component={Assess2} />
        <Route path="/user/login" exact component={Login} />
      </Switch>
    </Router>
  );
}

export default RouterConfig;
