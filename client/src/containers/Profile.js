import React, { Component } from 'react';
import StarRating from '../components/StarRating';
import { getUserId, invokeApig, s3Upload, s3Delete } from "../libs/aws-lib";
import LoadingButton from '../components/LoadingButton';
import ProfileImage from '../components/ProfileImage';
import './Profile.css';

class Profile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
      isEditing: false,
      imageDidChange: false,
      isSaving: false
    };

    this.image = null;
  }

  async componentDidMount() {
    let userId = await getUserId();
    // let user = await invokeApig({ path: `/user/${userId}` });
    // this.setState({ user: user });
    // console.log(user);
    this.setState({ user: {name: "Anthony", userId, profileImage: null, createdAt: new Date().getTime(), totalRating: 13, ratingCount: 4 } });
  }

  toggleEditing = async () => {
    if (this.state.imageDidChange) {
      // save edits & stop editing
      try {
        console.log("In");
        const image = this.image;
        if(this.state.user.profileImage) {
          console.log("delete");
          const regex = new RegExp(this.state.user.userId + ".+");
          const filename = this.state.user.profileImage.match(regex)[0];
          await s3Delete(filename);
        }
        let uploadFilename = (await s3Upload(image)).Location;
        console.log(uploadFilename, this.props.match.params.id);

        await this.saveUser({ profileImage: uploadFilename });
      } catch (e) {
        alert(e);
      }

    }
    this.image = null;
    this.setState({isEditing: !this.state.isEditing, imageDidChange: false });
  }

  saveUser(update) {
    return invokeApig({
      path: `/user/${this.props.match.params.id}`,
      method: "PUT",
      body: update
    });
  }

  getImageUpload = (image) => {
    this.image = image;
    this.setState({ imageDidChange: true})
  }

  render() {
    return (
      this.state.user && 
      <div className="Profile">
        <div className="profile-header">
          <ProfileImage
            imgURL={this.state.user.profileImage ? this.state.user.profileImage : '/assets/profile-avatar.svg'}
            alt="Profile Image"
            getImageUpload={this.getImageUpload}
            canUpload={this.state.isEditing}
          />
          <h1>{this.state.user.name}</h1>
          <p>{`User since: ${new Date(this.state.user.createdAt).toLocaleDateString()}`}</p>
          <StarRating
            count={5}
            color1="#333"
            size={24}
            value={this.state.user.totalRating / this.state.user.ratingCount}
            edit={false}
          />
          <LoadingButton
            className="edit-profile"
            onClick={this.toggleEditing}
            text={this.state.isEditing ? "Finish Editing" : "Edit Profile"}
            loadingText="Saving..."
            isLoading={this.state.isSaving}
          />
        </div>
        <h2>Your Posts</h2>
      </div>
    );
  }
}

export default Profile;