import React, { Component } from 'react';
import StripeAuthenticated from '../components/StripeAuthenticatedRoute';
import { Col, FormGroup, FormControl, ControlLabel, InputGroup } from 'react-bootstrap';
import LoadingButton from '../components/LoadingButton';
import { invokeApig } from "../libs/aws-lib";
import { getCurrentPosition, reverseGeocode, displayLocationError } from '../libs/geo-parser';
import "./NewPost.css";

class NewPost extends Component {
  constructor(props) {
    super(props);

    this.state = {
      title: "",
      description: "",
      price: 0.00,
      domain: "",
      coords: null,
      location: null,
      isSearchingForLocation: true,
      isLoading: false
    };

  }

  async componentDidMount() {
    try {
      this.setState({ isSearchingForLocation: true });
      const coords = await getCurrentPosition();
      const location = await reverseGeocode(coords);
      this.setState({ isSearchingForLocation: false, coords, location })

    } catch (e) {
      alert(displayLocationError(e));
      this.setState({ isSearchingForLocation: null });
    }
  }

  validateForm() {
    return (
      this.state.title.length > 0 &&
      this.state.description.length > 0 &&
      this.state.domain &&
      this.state.coords
    );
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = async event => {
    event.preventDefault();

    this.setState({ isLoading: true});

    try {
      await this.createPost({
        userId: this.props.user.userId,
        title: this.state.title,
        description: this.state.description,
        domain: this.state.domain,
        price: this.state.price,
        coords: this.state.coords
      });

      this.props.history.push("/")
    } catch (e) {
      alert(e);
      this.setState({isLoading: false});
    }

  }
  
  createPost(post) {
    return invokeApig({
      path: '/post/createnew',
      method: "POST",
      body: post
    });
  }

  displayLocation() {
    if(this.state.isSearchingForLocation) {
      return "Searching for location...";
    } else {
      return this.state.location;
    }
  }

  render() {
    return (
      <div className="NewPost">
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="title">
            <ControlLabel>Title</ControlLabel>
            <FormControl
              onChange={this.handleChange}
              value={this.state.title}
            />
          </FormGroup>
          <FormGroup controlId="description">
            <ControlLabel>Description</ControlLabel>
            <FormControl
              onChange={this.handleChange}
              value={this.state.description}
              componentClass="textarea"
            />
          </FormGroup>
          <Col xs={6}>
            <FormGroup controlId="price">
              <ControlLabel>Price</ControlLabel>
              <InputGroup>
                <InputGroup.Addon>$</InputGroup.Addon>
                <FormControl type="number" 
                  onChange={this.handleChange}
                  value={this.state.price}
                />
              </InputGroup>
            </FormGroup>
          </Col>
          <Col xs={6}>
          <FormGroup controlId="domain">
          <ControlLabel>Domain</ControlLabel>
          <FormControl 
            componentClass="select" 
            onChange={this.handleChange}
            placeholder="select">
            <option value="select">Choose...</option>
            <option>Photography</option>
            <option>Music Production</option>
            <option>Filmmaking</option>
            <option>Other</option>
          </FormControl>
          </FormGroup>
          </Col>
          <FormGroup>
            <ControlLabel>Location</ControlLabel>
            <FormControl.Static>
              {this.displayLocation()}
            </FormControl.Static>
          </FormGroup>
          <LoadingButton
            block
            bsStyle="primary"
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
            isLoading={this.state.isLoading}
            text="Create"
            loadingText="Creating…"
          />
        </form>
      </div>
    );
  }
}

export default StripeAuthenticated(NewPost);