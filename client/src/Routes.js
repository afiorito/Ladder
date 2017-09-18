import React from "react";
import { Route, Switch } from "react-router-dom";
import AppliedRoute from "./components/AppliedRoute";
import Home from "./containers/Home";
import Login from "./containers/Login";
import Signup from "./containers/Signup";
import Profile from "./containers/Profile";
import NewPost from "./containers/NewPost";
import NotFound from "./containers/NotFound";

export default ({ childProps }) =>
<Switch>
  <AppliedRoute path="/" exact component={Home} props={childProps} />
  <AppliedRoute path="/login" exact component={Login} props={childProps} />
  <AppliedRoute path="/signup" exact component={Signup} props={childProps} />
  <AppliedRoute path="/profile/:id" exact component={Profile} props={childProps} />
  <AppliedRoute path="/post/createnew" exact component={NewPost} props={childProps} />
  { /* Finally, catch all unmatched routes */ }
  <Route component={NotFound} />
</Switch>;