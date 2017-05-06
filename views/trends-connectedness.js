'use strict';
import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { pushPath } from 'redux-simple-router';
import TrendsNavigation from '../components/trends-navigation';

import ChartNetwork from '../components/charts/network-map';
import { fetchConnectedInvestments } from '../actions/action-creators';
import NetworkMapPopoverContent from '../components/network-map-popover-content';
import pluckUnique from '../utils/pluck-unique';
import ScrollReminder from '../components/scroll-reminder';


var Connectedness = React.createClass({
  propTypes: {
    dispatch: React.PropTypes.func,
    connectedInvestments: React.PropTypes.object,
    fetchingGeneralInvestments: React.PropTypes.bool,
    investments: React.PropTypes.array
  },

  componentDidMount: function () {
    if (!this.props.connectedInvestments.items.length) {
      this.props.dispatch(fetchConnectedInvestments());      
    }
    
  },

  popoverContentFn: function (d) {
    return (
      <NetworkMapPopoverContent
          type={d.type}
          name={d.name} />
    );
  },

  networkMapNodeClickHandler: function (d) {
    this.props.dispatch(pushPath(`/${d.type}/${d._id}`));
  },

  renderChart: function () {
    // We can't render the chart while the investments (all the investments
    // data that is, not the ones for the chart) are fetching because it slows
    // the rendering down terribly.
    if (this.props.fetchingGeneralInvestments) {
      return null;
    } else {
      return <ChartNetwork
                investments={this.props.connectedInvestments.items}
                popoverContentFn={this.popoverContentFn}
                nodeClickHandler={this.networkMapNodeClickHandler}
            />;
    }
  },

  renderSection: function () {
    let connectedInvestments = this.props.connectedInvestments.items;
    let investments = this.props.investments;

    let iids = pluckUnique(connectedInvestments, 'investor_id');

    let topInvestments = _(investments)
      .filter(d => _.contains(iids, d.investor_id))
      .value();

    let totTopCompanies = pluckUnique(topInvestments, 'company_id').length;
    let totCompanies = pluckUnique(investments, 'company_id').length;
    let companiesCommonInvestors = pluckUnique(connectedInvestments, 'company_id').length;
    let percent = totTopCompanies / totCompanies * 100;


    return (
      <div>
        <p className='metric'>Impact investing is a network of connections. The map at right shows top <span className='metric-highlight'>{iids.length} </span>most connected investors invest in <span className='metric-highlight'>{totTopCompanies} </span>companies making up {Math.round(percent)}% of the ecosystem. </p>
        <p className='metric'>Of these companies, <strong>{companiesCommonInvestors}</strong> have at least  two investors in common. </p>
        <p className='metric'>The schools most represented in the ecosystem are <strong>Stanford</strong>, <strong>Harvard</strong>, and the <strong>University of California, Berkely</strong>.</p>
        <p className='metric-disclaimer'>Disclaimer Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque interdum rutrum sodales. Nullam mattis fermentum libero. Lorem ipsum dolor sit amet. Pellentesque interdum rutrum sodales. Nullam mattis fermentum libero, non volutpa.</p>
      </div>
    );
  },

  render: function () {
    return (
      <div className='trends-connectedness trend-view' id='trends-1-connection'>
      <TrendsNavigation />
        <div className='flex-wrapper-center'>
          <div className='content-data'>
            <div className='inner'>
              <h1 className='page-sec-title'><p>Connectedness</p></h1>
              {this.props.fetchingGeneralInvestments ? (<p>Data is isLoading</p>) : (this.renderSection())}
          <div className='content-infographic'>
          <div className='connected-key'>
            <ul>
              <li>Investor</li>
              <li>Company</li>
              <li>Investment Made</li>
              <div></div>
              <li>Fewer Investments</li>
              <li>More Investments</li>
            </ul>
          </div>
          </div>              

            </div>
          </div>
          <div className='content-infographic'>
            <div className='inner'>
              {this.renderChart()}
            </div>
          </div>
        </div>

        <ScrollReminder />
      </div>
    );
  }
});

// /////////////////////////////////////////////////////////////////// //
// Connect functions

function selector (state) {
  return {
    connectedInvestments: state.connectedInvestments,
    investments: state.investments.items,
    fetchingGeneralInvestments: state.investments.fetching
  };
}

module.exports = connect(selector)(Connectedness);
