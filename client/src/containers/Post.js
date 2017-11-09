import React, { Component } from 'react';
import { Col, PageHeader, Button, ListGroup, ListGroupItem, Image } from 'react-bootstrap';
import Lightbox from 'react-images';
import StarRating from '../components/StarRating';
import { reverseGeocode } from '../libs/geo-parser';
import { invokeApig } from '../libs/aws-lib';
import { formatPrice } from '../helpers/price-helper';
import EmailModal from '../components/EmailModal';
import StripeCheckout from 'react-stripe-checkout';
import config from '../config';
import './Post.css';

class Post extends Component {
  constructor(props) {
    super(props);

    this.state = {
      post: {},
      purchases: [],
      isLoading: true,
      showModal: false,
      viewImages: false,
      activeImage: 0
    };
  }

  async componentDidMount() {
    let requests = [
      this.getPost(this.props.match.params)
    ];
    if(this.props.isCurrentUser(this.props.match.params.userId)) {
      requests.push(
        this.getPurchases(this.props.user.userId, this.props.match.params.postId)
      );
    }
    let [ post, purchases ] = await Promise.all(requests);

    if (post.title) {
      post.geoJson = JSON.parse(post.geoJson);
      const coords = {latitude: post.geoJson.coordinates[1], longitude: post.geoJson.coordinates[0]};
      post.location = await reverseGeocode(coords);
      this.setState({ post, purchases, isLoading: false });
    } else {
      // TODO: show post not found instead of this
      this.props.history.push('/post');
    }
    // this.setState({ post: {
    //   title: 'Offering Wedding Photography',
    //   description: 'Buy my services please',
    //   domain: 'Photography',
    //   price: '10000.99',
    //   geoJson: {type: "POINT", coordinates: [-73.5785649,45.4969574]},
    //   user: {
    //     profileImage: '/assets/profile-avatar.svg',
    //     name: 'Anthony Fiorito'
    //   }
    // }, isLoading: false });
  }

  showEmailModal = () => {
    this.setState({ showModal: true });
  }

  hideEmailModal = () => {
    this.setState({ showModal: false });
  }

  sendEmail = async ({ body, subject }) => {
    await invokeApig({
      path: '/email',
      method: 'POST',
      body: {
        body, subject,
        senderId: this.props.user.userId,
        receiverId: this.state.post.user.userId
      }
    });
    this.setState({ showModal: false });
  }

  getPost({userId, postId}) {
    return invokeApig({
      path: `/posts/${userId}/${postId}`
    });
  }

  getPurchases(customerId, postId) {
    return invokeApig({
      path: `/purchases/${customerId}/${postId}`
    });
  }

  handleToken = async (token) => {
    try {
      const purchase = await invokeApig({
        path: '/stripe/pay',
        method: 'POST',
        body: {
          token: token.id,
          customer: this.props.user,
          user: this.state.post.user,
          price: this.state.post.price,
          postId: this.state.post.postId
        }
      });
      this.setState({ purchases: this.state.purchases.concat([purchase]) });
    } catch (e) {
      console.log(e);
    }
  }

  handleRating = async (index, rating) => {
    let result = await this.updateRating(rating, this.state.purchases[index].purchaseId);
    console.log(result);
  }

  updateRating(rating, purchaseId) {
    return invokeApig({
      path: `/rating/${purchaseId}`,
      method: 'PUT',
      body: {
        rating: rating,
        userId: this.state.post.user.userId
      }
    });
  }

  showViewer = (index) => {
    this.setState({ viewImages: true, activeImage: index });
  }

  hideViewer = () => {
    this.setState({ viewImages: false});
  }

  goToNext = () => {
    this.setState({ activeImage: this.state.activeImage + 1 });
  }

  goToPrev = () => {
    this.setState({ activeImage: this.state.activeImage - 1 });
  }

  render() {
    let images = [];
    if(this.state.post && this.state.post.images) {
      images = this.state.post.images.split(",").map((image, index) => {
        return { src: image, alt: `image-${index}`}
      });
    }
    return ( !this.state.isLoading &&
      <div className="Post">
        <PostInfo {...this.state.post } />
        <UserInfo {...this.state.post } 
          isCurrentUser={this.props.isCurrentUser} 
          handleToken={this.handleToken}
          showEmailModal={this.showEmailModal}
        />
        <EmailModal 
          showModal={this.state.showModal}
          closeModal={this.hideEmailModal}
          sendEmail={this.sendEmail}
          title={`Send an email to ${this.state.post.user.name}`}
          />
        {this.state.post.images &&
        <Col xs={12}>
          <PageHeader>Product Images</PageHeader>
          {images.map((image, index) => 
            <Image 
              key={image.alt}
              className="product-image" 
              src={image.src} 
              onClick={this.showViewer.bind(null, index)} 
              rounded />
            )}
          <Lightbox 
            images={images}
            isOpen={this.state.viewImages}
            onClose={this.hideViewer}
            onClickNext={this.goToNext}
            onClickPrev={this.goToPrev}
            currentImage={this.state.activeImage}
          />
        </Col>}
        {this.props.isCurrentUser(this.state.post.user) &&
        <PreviousPurchases 
          handleRating={this.handleRating} 
          purchases={this.state.purchases} 
        />}
      </div>
    );
  }
}

export default Post;


const PostInfo = ({ title, location, description, domain, price, geoJson }) => (
  <Col md={8} xs={12} className="post-info col-md-push-4">
    <h2>TITLE</h2>
    <PageHeader className="title">{title}</PageHeader>
    <h2>DESCRIPTION</h2>
    <p className="description">{description}</p>
    <h2>DOMAIN</h2>
    <p className="domain">{domain}</p>
    <h2>PRICE</h2>
    <p className="price">{formatPrice(price)}</p>
    <h2>LOCATION</h2>
    <p className="location">{location}</p>
  </Col>
);

const UserInfo = ({ user, price , handleToken, ...props}) => (
  <Col md={4} xs={12} className="user-info  col-md-pull-8">
    <img src={user.profileImage || '/assets/profile-avatar.svg'} alt="Profile Avatar" />
    <h3>{user.name}</h3>
    <StarRating
      count={5}
      color1="#333"
      size={24}
      value={user.rating}
      edit={false}
    />
    { props.isCurrentUser(user) &&
      <div className="actions">
        <Button
          bsStyle="info"
          onClick={props.showEmailModal}
        >
          Message
        </Button>
        <StripeCheckout image="/favicon.ico" token={handleToken} stripeKey={config.stripe.publishable_test_key}>
          <Button bsStyle="success">Pay for Service</Button>
        </StripeCheckout>
      </div> }
  </Col>
);

const PreviousPurchases = ({ purchases, handleRating }) => (
  <Col xs={12} className="previous-purchase">
    <PageHeader>Previous Purchases</PageHeader>
    {purchases.length > 0 ?
      <ListGroup>
        {purchases.map((p, i) => 
          <ListGroupItem key={p.purchaseId}>
            {new Date(p.createdAt).toDateString()}
            <StarRating 
              count={5}
              color1="#333"
              size={16}
              value={p.rating}
              onChange={handleRating.bind(null, i)}
            />
          </ListGroupItem>
        )}
      </ListGroup> : <div className="center">You have no previous purchases</div> }
  </Col>
);