import React, { Component } from "react";
import Lander from '../components/Lander';
import Posts from './Posts';
import "./Home.css";

export default class Home extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="Home">
        {this.props.user ? <Posts /> : <Lander />}
      </div>
    );
  }
}