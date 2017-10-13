import React from "react";
import { Route, Redirect } from "react-router-dom";
import { querystring } from '../helpers/query-helper';

export default ({ component: C, props: cProps, ...rest }) => {
  const redirect = querystring("redirect");
  return (
    <Route
      {...rest}
      render={props =>
        !cProps.user
          ? <C {...props} {...cProps} />
          : <Redirect
              to={redirect === "" || redirect === null ? "/" : redirect}
            />}
    />
  );
};