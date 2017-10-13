import React from "react";
import LoadingButton from './LoadingButton';
import config from '../config';
import './StripeButton.css';

export default ({ isProcessing }) => {
  let { response_type, client_id, scope } = config.stripe;
  return (
    <LoadingButton
      className="StripeButton"
      block
      bsSize="large"
      href={`https://connect.stripe.com/oauth/authorize?response_type=${response_type}&client_id=${client_id}&scope=${scope}`}
      isLoading={isProcessing}
      text="Connect with Stripe"
      loadingText="Processing..."
    >
      Connect with Stripe
    </LoadingButton>
  );
};