import React, { Component } from 'react';
import StripeAuthenticated from '../components/StripeAuthenticatedRoute';
import { Col, FormGroup, FormControl, ControlLabel, InputGroup, Image, Button, Glyphicon } from 'react-bootstrap';
import LoadingButton from '../components/LoadingButton';
import { invokeApig, s3Upload } from "../libs/aws-lib";
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
      isLoadingImage: false,
      previewFiles: []
    };

    this.files = [];
    this.rawFiles = [];
    this.clickIndex = 0;

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
      let fileNames = [];
      if(this.rawFiles.length > 0) {
        const savedFiles = this.rawFiles;

        const uploads = [];
        const regex = /\.(jp(e)?g|png)$/i;

        savedFiles.forEach((file, i) => {
          const filename = `image-${i}${file.name.match(regex)[0]}`;
          uploads.push(s3Upload(file, filename));
        });

        fileNames = (await Promise.all(uploads)).map(u => u.Location);
      }

      await this.createPost({
        userId: this.props.user.userId,
        title: this.state.title,
        description: this.state.description,
        domain: this.state.domain,
        price: this.state.price,
        coords: this.state.coords,
        images: fileNames.join(',')
      });

      this.props.history.goBack();
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
    const file = event.target.files[0];

    console.log(file.type, file.type.match(/(jp(e)?g|png)$/i));
    if (!file.type) return;
    if (!file.type.match(/(jp(e)?g|png)$/i)) {
      alert("File should be an image.");
      return;
    }
    this.setState({ isLoadingImage: true });
    this.files = this.state.previewFiles;

    if (this.clickIndex === 'last') 
      this.clickIndex = this.state.previewFiles.length >= 2 ? 2 : this.state.previewFiles.length;

    await this.readFile(file, this.clickIndex);

    this.rawFiles[this.clickIndex] = file;

    this.setState({ previewFiles: this.files, isLoadingImage: false });
    this.files = null;
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

  openUpload = (index, event) => {
    event.preventDefault();
    this.clickIndex = index;
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
            {this.state.isLoadingImage && <Glyphicon glyph="refresh" className="spinning" />}
            <div className="product-images"> 
              {this.state.previewFiles.length >= 1 && <Image 
                                          onClick={this.openUpload.bind(null, 0)} 
                                          src={this.state.previewFiles[0]} 
                                          rounded />}
              {this.state.previewFiles.length >= 2 && <Image 
                                          onClick={this.openUpload.bind(null, 1)} 
                                          src={this.state.previewFiles[1]} 
                                          rounded />}
              {this.state.previewFiles.length >= 3 && <Image 
                                          onClick={this.openUpload.bind(null, 2)} 
                                          src={this.state.previewFiles[2]} 
                                          rounded />}
              <input 
              onChange={this.handleImageUpload}
              className="image-input" 
              type="file"
              accept=".jpg, .jpeg, .png"
              ref={(input) => { this.imageInput = input; }} />
              {this.state.previewFiles.length < 3 && 
                <Button 
                  onClick={this.openUpload.bind(null, 'last')}
                  className="add-image">
                  Add
                  </Button>}
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