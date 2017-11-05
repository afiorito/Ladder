import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import PostTable from '../components/PostTable';
import { getCurrentPosition, reverseGeocode } from '../libs/geo-parser';
import { invokeApig } from '../libs/aws-lib';
import "./LocalPosts.css";

class LocalPosts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      posts: [],
      location: null,
      coords: null,
      isSearchingForLocation: true,
      sortASC: false
    };
  }

  async componentDidMount() {
    try {
      const coords = await getCurrentPosition();
      const data = [reverseGeocode(coords), this.getLocalPosts(coords)];

      const [ location, posts ] = await Promise.all(data); 
      this.setState({ isSearchingForLocation: false, coords, posts, location });
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
    //       userId: "USERID"
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

  displayHeader() {
    if(this.state.isSearchingForLocation) {
      return `Searching for posts near you...`;
    } else {
      return `Local Posts`;
    }
  }

  sortPosts = (sortBy) => {
    let sorted = this.state.posts.slice();
    const asc = !this.state.sortASC;
    
    switch (sortBy) {
      case 'Title':
      case 'Domain':
      case 'Price':
        sorted.sort((a, b) => {
          const key = sortBy.toLowerCase();
          return asc ? a[key] > b[key] : a[key] < b[key];
        });
        break;
      case 'User Rating':
        sorted.sort((a, b) => {
          return asc ? a.user.rating > b.user.rating : a.user.rating < b.user.rating;
        });
        break;
      default:
        break;
    }

    this.setState({ posts: sorted, sortASC: asc });
  }

  sort(a, b, by) {
    return this.state.sortASC ? b[by] > a[by] : b[by] < a[by];
  }

  render() {
    return (
      <div className="LocalPosts">
        <header>
          <div className="top">
            <h1>{this.displayHeader()}</h1>
            <Button 
              
              bsSize="small" bsStyle="primary" 
              href="/post/createnew"
            >
              Add New Post
            </Button>
          </div>
          {this.state.coords && <p>{`Near ${this.state.location}`}</p>}
        </header>
        <PostTable
          posts={this.state.posts}
          headings={["Title", "Domain", "Price", "User Rating"]}
          sortPosts={this.sortPosts}
          striped
          responsive
        />
      </div>
    );
  }
}

export default LocalPosts;