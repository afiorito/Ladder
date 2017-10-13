import React from "react";
import { Redirect } from "react-router-dom";

export default (C) => {
  return class extends React.Component {
    render() {
      if(this.props.user.stripeId) {
        return <C />
      } 
      return <Redirect to={`/stripe-setup?redirect=${this.props.location.pathname}${this.props.location.search}`} />
    }
  }
}