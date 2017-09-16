import React, { Component } from 'react';
import config from '../config';
import "./ProfileImage.css";

class ProfileImage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      previewImg: null
    };

    this.file = null;

  }

  editPhoto = () => {
    let input = document.getElementById("file-input");
    input.click();
  }

  handleFileUpload = event => {
    this.file = event.target.files[0];
    this.props.getImageUpload(this.file);
    this.displayTemporaryImage();
  }

  displayTemporaryImage() {
    if(this.file && this.file.size < config.MAX_ATTACHMENT_SIZE) {
      const reader = new FileReader();

      reader.onload = (e) => {
        this.setState({ previewImg: e.target.result });
      }

      reader.readAsDataURL(this.file);

    } else {
      alert("Please select a file smaller than 5MB");
    }
  }

  render() {
    let { imgURL, alt, canUpload } = this.props;
    let { previewImg } = this.state;
    return (
      <div className="ProfileImage">
        { canUpload && <div className="overlay">
          <div className="overlay-bg"></div>
          <div onClick={this.editPhoto} className="overlay-text">Edit Photo</div>
        </div> }
        <img src={previewImg ? previewImg : imgURL} alt={alt} />
        <input onChange={this.handleFileUpload} className="profile-image-input" id="file-input" type="file" accept=".jpg, .jpeg, .png" />
      </div>
    );
  }
}

export default ProfileImage;