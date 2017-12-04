import React, { Component } from 'react';
import { Col, Button } from 'react-bootstrap';
import StripeButton from '../components/StripeButton';
import { querystring } from '../helpers/query-helper';
import { invokeApig } from '../libs/aws-lib';
import './StripeSetup.css';

class StripeSetup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isProcessing: false
    };
  }


  async componentDidMount() {
    const code = querystring("code");
    const { user } = this.props;
    if(!user.stripeId && code) {
      try {
        this.setState({ isProcessing: true });
        const stripeAuth = await this.authorize(code, user.userId);
        this.setState({ isProcessing: false });
        const updatedUser = {...user}
        updatedUser.stripeId = stripeAuth.stripeId;
        
        this.props.userHasAuthenticated(updatedUser);
      } catch (e) { 
        console.log(e);
      }
    }
  }

  authorize(code, userId) {
    console.log(code, userId);
    return invokeApig({
      path: `/stripe/${userId}`,
      method: 'PUT',
      body: { code: code }
    });
  }

  renderSetup() {
    return (
      <Col sm={12} md={8} mdOffset={2} >
        <h1>Stripe Setup</h1>
        <p>Stripe setup is required to be able to post and buy services. Click the button below to begin linking your stripe account</p>
        <StripeButton {...this.state} />
      </Col>
    );
  }

  renderSetupConfirmed() {
    return (
      <Col sm={12} md={8} mdOffset={2} >
        <h1>Stripe Setup</h1>
        <p>Your account is already setup with stripe. You can now post your services and buy from others.</p>
        <Button 
          href="/"
        >
        Go to local posts
        </Button>
      </Col>
    );
  }

  render() {
    return (
      <div className="StripeSetup">
        { this.props.user.stripeId ? this.renderSetupConfirmed() : this.renderSetup()}
      </div>
    );
  }
}

export default StripeSetup;