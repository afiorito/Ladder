import React, { Component } from "react";
import { authUser, invokeApig, signOutUser } from "./libs/aws-lib";
import { Link, withRouter } from "react-router-dom";
import { Nav, NavItem, Navbar } from "react-bootstrap";
import RouteNavItem from "./components/RouteNavItem";
import Routes from "./Routes";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
  
    this.state = {
      posts: [],
      location: null,
      coords: null,
      isAuthenticating: true,
      user: false
    };
  }

  async componentDidMount() {
    try {
      let userId = await authUser();
      if(userId) {
        let user = await invokeApig({ path: `/user/${userId}` });
        this.userHasAuthenticated(user);
      } else {
        this.userHasAuthenticated(null);
      }
    }
    catch(e) {
      alert(e);
    }
  
    this.setState({ isAuthenticating: false });
  }
  
  userHasAuthenticated = user => {
    this.setState({ user: user });
  }

  isCurrentUser = user => {
    return this.state.user.userId !== user.userId;
  }

  handleLogout = event => {
    signOutUser();

    this.userHasAuthenticated(null);
    this.props.history.push("/login");
  }

  updateStore = (newState) => {
    this.setState(newState);
  }

  render() {
    const childProps = {
      user: this.state.user,
      userHasAuthenticated: this.userHasAuthenticated,
      isCurrentUser: this.isCurrentUser
    };

    const store = {
      posts: this.state.posts,
      location: this.state.location,
      coords: this.state.coords,
      updateStore: this.updateStore
    };
  
    return (
      !this.state.isAuthenticating &&
      <div className="App container">
        <Navbar fluid collapseOnSelect>
          <Navbar.Header>
            <Navbar.Brand>
              <Link to="/">Ladder</Link>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav pullRight>
              {this.state.user
                ? [
                  <RouteNavItem key={1} href="/">
                    Posts
                  </RouteNavItem>,
                  <RouteNavItem key={2} href={`/profile/${this.state.user.userId}`}>
                    Profile
                  </RouteNavItem>, 
                  <NavItem key={3} onClick={this.handleLogout}>Logout</NavItem>
                ] : [
                    <RouteNavItem key={2} href="/signup">
                      Signup
                    </RouteNavItem>,
                    <RouteNavItem key={3} href="/login">
                      Login
                    </RouteNavItem>
                  ]}
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Routes childProps={childProps} store={store} />
      </div>
    );
  }
}

export default withRouter(App);
