import React, { Component } from 'react';
import StarRating from '../components/StarRating';
import { invokeApig, s3Upload, s3Delete } from "../libs/aws-lib";
import LoadingButton from '../components/LoadingButton';
import ProfileImage from '../components/ProfileImage';
import PostTable from '../components/PostTable';
import { Col, ListGroup, ListGroupItem, PageHeader } from 'react-bootstrap';
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
    let user = await this.getUser(this.props.match.params.id);
    let transactions = await this.getTransactions(user.userId);
    this.setState({ user, transactions });

    this.setState({ isPostsLoading: true });
    let posts = await this.getPosts(user.userId);
    this.setState({ isPostsLoading: false });
    // let posts = [
    //   {
    //     postId: "141232332",
    //     title: "Offering Wedding Photography", 
    //     domain: "Photography", 
    //     price: 5.99,
    //     user: {
    //       userId: "USERID"
    //     }
    //   }
    // ];
    // let user = {name: "Anthony", userId, profileImage: null, createdAt: new Date().getTime()};

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

  getTransactions = (userId) => {
    return invokeApig({
      path: `/transactions/${userId}`
    });
  }

  render() {
    return (
      this.state.user && 
      <div className="Profile">
        <Col md={4} xs={12} className="profile-header">
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
            value={this.state.user.rating}
            edit={false}
          />
          <LoadingButton
            className="edit-profile"
            onClick={this.toggleEditing}
            text={this.state.isEditing ? "Finish Editing" : "Edit Profile"}
            loadingText="Saving..."
            isLoading={this.state.isSaving}
          />
        </Col>
        <Col md={8} xs={12}>
          <PageHeader>Your Posts</PageHeader>
          <PostTable
            posts={this.state.posts}
            headings={["Title", "Domain", "Price"]}
            user={this.state.user}
            loadingPosts={this.state.isPostsLoading}
            sortPosts={() => {}}
            striped
            responsive
          />
        </Col>
        <Col xs={12}>
          <PageHeader>Your Sales</PageHeader>
          { this.state.transactions.sales.length > 0 ?
          <ListGroup>
            {this.state.transactions.sales.map(s => 
              <ListGroupItem key={s.purchaseId}>
                {new Date(s.createdAt).toDateString()}
                <span>Received: ${s.price}</span>
                <StarRating 
                  count={5}
                  color1="#333"
                  size={16}
                  value={s.rating}
                  edit={false}
                />
              </ListGroupItem>
            )}
          </ListGroup> : <div className="center">You have no sales</div>}
        </Col>
        <Col xs={12}>
          <PageHeader>Your Purchases</PageHeader>
          { this.state.transactions.purchases.length > 0 ?
          <ListGroup>
            {this.state.transactions.purchases.map(p => 
              <ListGroupItem key={p.purchaseId}>
                {new Date(p.createdAt).toDateString()}
                <span>Payed: ${p.price}</span>
                <StarRating 
                  count={5}
                  color1="#333"
                  size={16}
                  value={p.rating}
                  edit={false}
                />
              </ListGroupItem>
            )}
          </ListGroup> : <div className="center">You have no purchases</div>}
        </Col>
      </div>
    );
  }
}

export default Profile;