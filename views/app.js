'use strict';
import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Link } from 'react-router';
// import DevTools from '../components/dev-tools';
import {Parallax} from '../bower_components/parallax/deploy/parallax';
import {Waypoint} from '../bower_components/waypoints/lib/noframework.waypoints.js';

import { fetchInvestments } from '../actions/action-creators';
import Footer from '../components/footer';

// as soon as app mounts, fetch investments
var App = React.createClass({
  propTypes: {
    dispatch: React.PropTypes.func,
    routes: React.PropTypes.array,
    children: React.PropTypes.object,
    activeTrendSection: React.PropTypes.string
  },

  componentDidMount: function () {
    this.props.dispatch(fetchInvestments());
  },

  render: function () {
    //let route = _.last(this.props.routes).path;
    //let klass = this.mapClassToRoute(route) + ' main-wrapper';
    //let showFooter = this.showFooterBool(route);

    return (
      //<div className={klass}>
      <div className="main-wrapper">
        <main role='main' className='flex-wrapper '>
          {this.props.children}
        </main>
        <Footer />
      </div>
    );
  }
});

//{showFooter ? (<Footer />) : null}


//
// Redux
//
function selector (state) {
  return {
    activeTrendSection: state.trends.activeSection
  };
}


module.exports = connect(selector)(App);
