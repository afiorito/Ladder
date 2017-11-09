import React, { Component } from "react";
import Lander from '../components/Lander';
import LocalPosts from './LocalPosts';
import "./Home.css";

export default class Home extends Component {
  render() {
    return (
      <div className="Home">
        {this.props.user ? <LocalPosts {...this.props} /> : <Lander />}
      </div>
    );
  }
}