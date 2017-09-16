import React, { Component } from 'react';
import { PageHeader, Button } from 'react-bootstrap';

class Posts extends Component {
  render() {
    return (
      <div className="Posts">
        <PageHeader>
          Local Posts
          <Button
            bsStyle="primary"
            className="pull-right"
          >
            Add New Post
          </Button>
        </PageHeader>
      </div>
    );
  }
}

export default Posts;