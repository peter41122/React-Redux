'use strict';
import React from 'react';
import classNames from 'classnames';
import ScrollNavigation from '../utils/scroll-navigation';

var TrendsNavigation = React.createClass({
  propTypes: {
    //trend: React.PropTypes.string.isRequired,
    //section: React.PropTypes.string.isRequired,
    //onNavigationHandler: React.PropTypes.func.isRequired
  },

  scrollNavigation: null,

  navMatrix: {
    'connectedness-general': {
      path: '/trends/connectedness',
      section: 'general',
      filter: '',
      prev: null,
      next: 'geography-general'
    },
    'geography-general': {
      path: '/trends/geography',
      section: 'general',
      filter: null,
      prev: 'connectedness-general',
      next: 'geography-breakdown'
    },
    'geography-breakdown': {
      path: '/trends/geography',
      section: 'breakdown',
      filter: null,
      prev: 'geography-general',
      next: 'sector-general'
    },
    'sector-general': {
      path: '/trends/sector',
      section: 'general',
      filter: 'all',
      prev: 'geography-breakdown',
      next: 'sector-breakdown'
    },
    'sector-breakdown': {
      path: '/trends/sector',
      section: 'breakdown',
      filter: 'top-sector',
      prev: 'sector-general',
      next: 'rounds-general'
    },
    'rounds-general': {
      path: '/trends/rounds',
      section: 'general',
      filter: 'all',
      prev: 'sector-breakdown',
      next: 'rounds-breakdown'
    },
    'rounds-breakdown': {
      path: '/trends/rounds',
      section: 'breakdown',
      filter: 'sector',
      prev: 'rounds-general',
      next: null
    }
  },

  navigateTrends: function (destination, e) {
    e.preventDefault();
    let {path, section, filter} = this.navMatrix[destination];
    this.scrollNavigation.reset();
    this.props.onNavigationHandler(path, section, filter);
  },

  scrollNavigationHandler: function (direction) {
    let {trend, section} = this.props;
    let current = `${trend}-${section}`;
    let newNav;

    if (direction === 'prev') {
      newNav = this.navMatrix[current].prev;
    } else if (direction === 'next') {
      newNav = this.navMatrix[current].next;
    } else {
      newNav = null;
    }

    if (newNav !== null) {
      let {path, section, filter} = this.navMatrix[newNav];
      this.scrollNavigation.reset();
      this.props.onNavigationHandler(path, section, filter);
    }
  },

  componentDidMount: function () {
    //this.scrollNavigation = new ScrollNavigation()
    //  .onNavigation(this.scrollNavigationHandler)
    //  .start();
    $('#trends-nav a:not(.anchor-redirect)').on('click', function(event){
      event.preventDefault();
      var id_str = $(this).attr('href');
      var target = $(id_str);
      if( target.length ) {
          $('html, body').animate({
              scrollTop: target.offset().top
          }, 500);
      }

    });
  },

  componentWillUnmount: function () {
    //this.scrollNavigation.stop();
  },

  render: function () {
    //let {trend, section} = this.props;
    return (
        <nav className='trends-navigation'>
          <ul id='trends-nav'>
            <li className='#'><a href="#trends-1-connection">Connectedness</a></li>
            <li className='geo'><a href="#trends-2-geo">Geography</a></li>
            <li className='rounds'><a href="#trends-3-rounds">Issue Areas</a></li>
            <li className='types'><a href="#trends-4-types">Investments</a></li>
            <li><a href="#/explore" className="anchor-redirect">The Network</a></li>
          </ul>
        </nav>
    )
    //return (
    //  <ul className='trends-navigation'>
    //    <li className={classNames({active: trend === 'connectedness' && section === 'general'})}><a href='#' onClick={this.navigateTrends.bind(this, 'connectedness-general')}><span>Trends in Investment Connectedness</span></a></li>
    //    <li className={classNames({active: trend === 'geography' && section === 'general'})}><a href='#' onClick={this.navigateTrends.bind(this, 'geography-general')}><span>Trends in Investment Geography - General</span></a></li>
    //    <li className={classNames({active: trend === 'geography' && section === 'breakdown'})}><a href='#' onClick={this.navigateTrends.bind(this, 'geography-breakdown')}><span>Trends in Investment Geography - Breakdown</span></a></li>
    //    <li className={classNames({active: trend === 'sector' && section === 'general'})}><a href='#' onClick={this.navigateTrends.bind(this, 'sector-general')}><span>Trends in Investment Sectors - General</span></a></li>
    //    <li className={classNames({active: trend === 'sector' && section === 'breakdown'})}><a href='#' onClick={this.navigateTrends.bind(this, 'sector-breakdown')}><span>Trends in Investment Sectors - Breakdown</span></a></li>
    //    <li className={classNames({active: trend === 'rounds' && section === 'general'})}><a href='#' onClick={this.navigateTrends.bind(this, 'rounds-general')}><span>Trends in Investment Rounds - General</span></a></li>
    //    <li className={classNames({active: trend === 'rounds' && section === 'breakdown'})}><a href='#' onClick={this.navigateTrends.bind(this, 'rounds-breakdown')}><span>Trends in Investment Rounds - Breakdown</span></a></li>
    //  </ul>
    //);
  }
});

module.exports = TrendsNavigation;
