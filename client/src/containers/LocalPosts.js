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
      isSearchingForLocation: false,
      sortASC: false
    };
  }

  async componentDidMount() {
    try {
      if(this.props.posts.length === 0) {
        this.setState({ isSearchingForLocation: true });
      }
      const coords = await getCurrentPosition();
      const data = [reverseGeocode(coords), this.getLocalPosts(coords)];

      const [ location, posts ] = await Promise.all(data);
      this.props.updateStore({ coords, posts, location });
      this.setState({ isSearchingForLocation: false });
    } catch (e) {
      alert(e.message);
      this.setState({ isSearchingForLocation: null });
    }
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
    let sorted = this.props.posts.slice();
    const asc = !this.state.sortASC;

    console.log("sort");

    switch (sortBy) {
      case 'Title':
      case 'Domain':
        sorted.sort((a, b) => {
          const key = sortBy.toLowerCase();
          const mult = asc ? 1 : -1;
          if(a[key] < b[key]) return -1 * mult;
          if(a[key] > b[key]) return 1 * mult;
          return 0;
        });
        break;
      case 'Price':
      case 'User Rating':
        sorted.sort((a, b) => {
          const key = sortBy.toLowerCase();
          return asc ? b[key] - a[key] : a[key] - b[key];
        });
        break;
      default:
        break;
    }

    this.props.updateStore({ posts: sorted });
    this.setState({ sortASC: asc });
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
          {this.props.coords && <p>{`Near ${this.props.location}`}</p>}
        </header>
        <PostTable
          posts={this.props.posts}
          headings={["Title", "Domain", "Price", "User Rating"]}
          sortPosts={this.sortPosts}
          loadingPosts={this.state.isSearchingForLocation}
          striped
          responsive
        />
      </div>
    );
  }
}

export default LocalPosts;