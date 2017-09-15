import React from "react";
import { Button } from 'react-bootstrap';
import config from '../config';
import './StripeButton.css';

export default props => {
  let { response_type, client_id, scope } = config.stripe;
  return (
    <Button
      className="StripeButton"
      block
      bsSize="large"
      href={`https://connect.stripe.com/oauth/authorize?response_type=${response_type}&client_id=${client_id}&scope=${scope}`}>
      Connect with Stripe
    </Button>
  );
};