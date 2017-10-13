import React from "react";
import { Route, Switch } from "react-router-dom";
import AppliedRoute from "./components/AppliedRoute";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute";
import Home from "./containers/Home";
import Login from "./containers/Login";
import Signup from "./containers/Signup";
import Profile from "./containers/Profile";
import NewPost from "./containers/NewPost";
import Post from './containers/Post';
import StripeSetup from './containers/StripeSetup';
import NotFound from "./containers/NotFound";

export default ({ childProps }) =>
<Switch>
  <AppliedRoute path="/" exact component={Home} props={childProps} />
  <UnauthenticatedRoute path="/login" exact component={Login} props={childProps} />
  <UnauthenticatedRoute path="/signup" exact component={Signup} props={childProps} />
  <AuthenticatedRoute path="/profile/:id" exact component={Profile} props={childProps} />
  <AuthenticatedRoute path="/post/createnew" exact component={NewPost} props={childProps} />
  <AuthenticatedRoute path="/post/:postId/:userId" exact component={Post} props={childProps} />
  <AuthenticatedRoute path="/stripe-setup" exact component={StripeSetup} props={childProps} />
  { /* Finally, catch all unmatched routes */ }
  <Route component={NotFound} />
</Switch>;