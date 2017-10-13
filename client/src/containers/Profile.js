import React, { Component } from 'react';
import StarRating from '../components/StarRating';
import { getUserId, invokeApig, s3Upload, s3Delete } from "../libs/aws-lib";
import LoadingButton from '../components/LoadingButton';
import ProfileImage from '../components/ProfileImage';
import PostTable from '../components/PostTable';
import './Profile.css';

class Profile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
      posts: [],
      isEditing: false,
      imageDidChange: false,
      isSaving: false,
      isPostsLoading: false
    };

    this.image = null;
  }

  async componentDidMount() {
    let userId = await getUserId();
    let user = await this.getUser(userId);
    this.setState({ user: user });

    this.setState({ isPostsLoading: true });
    let posts = await this.getPosts(userId);
    this.setState({ isPostsLoading: false });
    // let posts = [
    //   {
    //     postId: "141232332",
    //     title: "Offering Wedding Photography", 
    //     domain: "Photography", 
    //     price: 5.99,
    //     user: {
    //       userId: "USERID",
    //       totalRating: 10,
    //       ratingCount: 2
    //     }
    //   }
    // ];
    // let user = {name: "Anthony", userId, profileImage: null, createdAt: new Date().getTime(), totalRating: 13, ratingCount: 4 };

    this.setState({ user: user, posts: posts});
  }

  toggleEditing = async () => {
    if (this.state.imageDidChange) {
      // save edits & stop editing
      try {
        const image = this.image;
        if(this.state.user.profileImage) {
          const regex = new RegExp(this.state.user.userId + ".+");
          const filename = this.state.user.profileImage.match(regex)[0];
          await s3Delete(filename);
        }
        let uploadFilename = (await s3Upload(image)).Location;

        await this.saveUser({ profileImage: uploadFilename });
      } catch (e) {
        alert(e);
      }

    }
    this.image = null;
    this.setState({isEditing: !this.state.isEditing, imageDidChange: false });
  }

  getPosts(userId) {
    return invokeApig({
      path: `/posts/${userId}`
    });
  }

  getUser(userId) {
    return invokeApig({ 
      path: `/user/${userId}` 
    });
  }

  saveUser(update) {
    return invokeApig({
      path: `/user/${this.props.match.params.id}`,
      method: 'PUT',
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
        <PostTable
          posts={this.state.posts}
          headings={["Title", "Domain", "Price"]}
          user={this.state.user}
          loadingPosts={this.state.isPostsLoading}
          striped
          responsive
        />
      </div>
    );
  }
}

export default Profile;