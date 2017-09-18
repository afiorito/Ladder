import React, { Component } from 'react';
import StarRating from '../components/StarRating';
import { Button, Table } from 'react-bootstrap';
import { getCurrentPosition } from '../libs/geo-parser';
import { invokeApig } from '../libs/aws-lib';
import "./Posts.css";

class Posts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      posts: [],
      location: null,
      coords: null,
      isSearchingForLocation: true
    };
  }

  async componentDidMount() {
    try {
      const coords = await getCurrentPosition();
      const posts = await this.getLocalPosts(coords);
      this.setState({ isSearchingForLocation: false, coords: coords, posts: posts });
    } catch (e) {
      alert(e.message);
      this.setState({ isSearchingForLocation: null });
    }
    // this.setState({ posts: [
    //   {
    //     postId: "141232332",
    //     title: "Offering Wedding Photography", 
    //     domain: "Photography", 
    //     price: 5.99,
    //     user: {
    //       totalRating: 10,
    //       ratingCount: 2
    //     }
    //   }
    // ]});
  }

  getLocalPosts({latitude, longitude}) {
    return invokeApig({
      path: '/posts',
      queryParams: {
        latitude: latitude,
        longitude: longitude
      }
    });
  }

  renderPosts() {
    return this.state.posts.map(post => (
      <tr key={post.postId}>
        <td className="title">{post.title}</td>
        <td className="domain">{post.domain}</td>
        <td className="price">${post.price}</td>
        <td>
          <StarRating
            count={5}
            color1="#333"
            size={16}
            value={post.user.totalRating / post.user.ratingCount}
            edit={false}
          />
        </td>
      </tr>
    ));
  }

  displayHeader() {
    if(this.state.isSearchingForLocation) {
      return `Searching for posts near you...`;
    } else {
      return `Local Posts`;
    }
  }

  render() {
    return (
      <div className="Posts">
        <header>
          <div className="top">
            <h1>{this.displayHeader()}</h1>
            <Button 
              className="pull-right"
              bsSize="small" bsStyle="primary" 
              href="/post/createnew"
            >
              Add New Post
            </Button>
          </div>
          {this.state.coords && <p>{`Near ${this.state.coords.latitude}, ${this.state.coords.longitude}`}</p>}
        </header>
        <Table responsive striped>
          <thead>
            <tr>
              <th>Title</th>
              <th>Domain</th>
              <th>Price</th>
              <th>User Rating</th>
            </tr>
          </thead>
          <tbody>
            {this.renderPosts()}
          </tbody>
        </Table>
      </div>
    );
  }
}

export default Posts;