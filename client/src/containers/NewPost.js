import React, { Component } from 'react';
import StripeAuthenticated from '../components/StripeAuthenticatedRoute';
import { Col, FormGroup, FormControl, ControlLabel, InputGroup, Image, Button } from 'react-bootstrap';
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
      isLoading: false,
      previewFiles: []
    };

    this.files = [];

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

  handleImageUpload = async (event) => {
    event.preventDefault();
    const files = event.target.files;
    const savedFiles = this.files;
    if(files.length > 3) {
      alert('You can only upload a maximum of 3 files.');
      return;
    }

    // If theres more savedFiles start from there
    // if theres more files uploaded start there
    let writeIndex = Math.max(savedFiles.length, files.length) - 1;
    let stopIndex = Math.max(savedFiles.length - files.length, 0);

    let fileWrites = [];

    for(writeIndex; writeIndex >= stopIndex; writeIndex--) {
      this.files[writeIndex] = files[writeIndex];
      fileWrites.push(this.readFile(this.files[writeIndex], writeIndex));
    }

    await Promise.all(fileWrites);
    this.setState({ previewFiles: this.files });

  }

  readFile(file, index) {
    const reader = new FileReader();
    
    reader.readAsDataURL(file);

    return new Promise((resolve, reject) => {
      reader.onload = (e) => {
        this.files[index] = e.target.result;
        resolve();
      }
    });

  }

  openUpload = (event) => {
    event.preventDefault();
    this.imageInput.click();
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
            <ControlLabel>Upload Photos (3 maximum)</ControlLabel>
            <div className="product-images"> 
              {this.files.length >= 1 && <Image block src={this.state.previewFiles[0]} rounded />}
              {this.files.length >= 2 && <Image block src={this.state.previewFiles[1]} rounded />}
              {this.files.length >= 3 && <Image block src={this.state.previewFiles[2]} rounded />}
              <input 
              onChange={this.handleImageUpload}
              className="image-input" 
              type="file"
              accept=".jpg, .jpeg, .png"
              ref={(input) => { this.imageInput = input; }} 
              multiple />
              <Button 
              onClick={this.openUpload}
              className="add-image">
              Add
              </Button>
            </div>
          </FormGroup>
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