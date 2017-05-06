'use strict';
import React from 'react';
import { connect } from 'react-redux';
import { batchActions } from 'redux-batched-actions';
import { pushPath } from 'redux-simple-router';
import { setTrendsFilter, setTrendsSection } from '../actions/action-creators';
import TrendsNavigation from '../components/trends-navigation';

import TrendsConn from './trends-connectedness';
import TrendsSector from './trends-sector';
import TrendsRounds from './trends-rounds';
import TrendsGeo from './trends-geography';

var Trends = React.createClass({
  propTypes: {
    dispatch: React.PropTypes.func,
    children: React.PropTypes.object,
    routes: React.PropTypes.array,
    activeSection: React.PropTypes.string
  },

  onNavigationHandler: function (path, section, filter) {
    let actions = [
      pushPath(path),
      setTrendsSection(section)
    ];
    if (filter !== null) {
      actions.push(setTrendsFilter(filter));
    }
    this.props.dispatch(batchActions(actions));
  },
  componentDidMount: function() {
    
    $('#scroller-top').on('click', function(event) {
        var id_str = "#masterScene";
        var target = $(id_str);
        if( target.length ) {
            $('html, body').animate({
                scrollTop: target.offset().top
            }, 500);
        }
    });
  },
  render: function () {
    //let routes = this.props.routes;
    //let last = routes[routes.length - 1];
    //let activeSection = this.props.activeSection;

    return (
        <div className="trends-wrapper" id="trends-section">
          <section className='trends-page-content' id="section-header">
            {this.props.children}
          </section>
          <main>
            <TrendsConn />
            <TrendsGeo />
            <TrendsSector />
            <TrendsRounds />
            <div className="trends-goto">
            <div className='flex-wrapper-center'>
            <p>Ready to make a difference?</p>
            
            <h2><a href="#/explore">Explore<br/>impact<br/>Investing</a></h2>

            <p>Invest in multiple companies?</p>
            
            <h2><a href="http://impactspace.com/addtoimpactspace" target="_new">Share <br/>your <br/>data</a></h2>


            </div>

            <span id="scroller-top">Back to Top</span>
            </div>
          </main>

        </div>

    );
  }
});

//            <TrendsNavigation trend={last.path} section={activeSection} onNavigationHandler={this.onNavigationHandler} />


// /////////////////////////////////////////////////////////////////// //
// Connect functions

function selector (state) {
  return {
    activeSection: state.trends.activeSection
  };
}

module.exports = connect(selector)(Trends);
