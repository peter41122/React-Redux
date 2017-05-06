'use strict';
import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Link } from 'react-router';

import Header from '../components/header';
import { fetchConnectedInvestments, fetchTotalNumbers } from '../actions/action-creators';
import ChartNetwork from '../components/charts/network-map';
import pluckUnique from '../utils/pluck-unique';

import HomeMap from '../components/charts/home-map.js';



var Home = React.createClass({
  propTypes: {
    dispatch: React.PropTypes.func,
    connectedInvestments: React.PropTypes.object,    
    totalNumbers: React.PropTypes.object,
    fetchingGeneralInvestments: React.PropTypes.bool,
    investments: React.PropTypes.array
  },

  componentDidMount: function () {
    this.props.dispatch(fetchConnectedInvestments());
    this.props.dispatch(fetchTotalNumbers());
    
    var scene = document.getElementById('masterScene');
    var parallax = new Parallax(scene);
    console.dir(Parallax);

    var stickyNav = $('#trends-1-connection').waypoint({
        handler: function(direction) {
            if (direction === 'up'){
              $('#trends-section').removeClass('sticky-nav');
            }else if(direction === 'down'){
              $('#trends-section').addClass('sticky-nav');
            }
            console.log('Direction: ' + direction);
        }
    });


    var stickyGeo = $('.trends-geo').waypoint({
        handler: function(direction) {
            if (direction === 'up'){
              $('.trends-geo').removeClass('sticky-box');
              $('.trends-geo .content-data').removeClass('sticky');
            }else if(direction === 'down'){
              $('.trends-geo').addClass('sticky-box');
              $('.trends-geo .content-data').addClass('sticky');
            }
            console.log('Geo: ' + direction);
        },
        offset: '0px'
    });


    var unstickyGeo = $('.trends-sector').waypoint({
        handler: function(direction) {
            if (direction === 'up'){
              $('.trends-geo').addClass('sticky-box');
              $('.trends-geo .content-data').addClass('sticky');
            }else if(direction === 'down'){
              $('.trends-geo').removeClass('sticky-box');
              $('.trends-geo .content-data').removeClass('sticky');
            }
            console.log('Geo: ' + direction);
        },
        offset: '520px'
    });



    var navPlace1 = $('#trends-1-connection').waypoint({
  handler: function(direction) {
    if (direction === 'down'){
            $('#trends-nav').addClass('connection');
            }
  },
  offset: '50%'
});
        var navPlace2 = $('#trends-2-geo').waypoint({
  handler: function(direction) {
          if (direction === 'down'){
              //all above
              $('#trends-nav').removeClass('connection');
            }
            $('#trends-nav').addClass('geo');
  },
  offset: '50%'
});
                var navPlace3 = $('#trends-3-rounds').waypoint({
  handler: function(direction) {
          if (direction === 'down'){
              //all above
              $('#trends-nav').removeClass('1-connection').removeClass('geo');
            }
            $('#trends-nav').addClass('rounds');
  },
  offset: '50%'
});
                                var navPlace4 = $('#trends-4-types').waypoint({
  handler: function(direction) {
            if(direction === 'down'){
              //all above
              $('#trends-nav').removeClass('connection').removeClass('geo').removeClass('rounds');
            }
            $('#trends-nav').addClass('types');
  },
  offset: '50%'
});

    var navPlace5 = $('#trends-1-connection').waypoint({
  handler: function(direction) {
    $('#trends-nav').addClass('connection');
    if (direction === 'up'){
            //all below
              $('#trends-nav').removeClass('geo').removeClass('rounds').removeClass('types');
            }
  }
});
        var navPlace6 = $('#trends-2-geo').waypoint({
  handler: function(direction) {
          if (direction === 'up'){
            //all below
              $('#trends-nav').removeClass('rounds').removeClass('types');
            }
            $('#trends-nav').addClass('geo');
  }
});
                var navPlace7 = $('#trends-3-rounds').waypoint({
  handler: function(direction) {
          if (direction === 'up'){
            //all below
              $('#trends-nav').removeClass('types');
            }
            $('#trends-nav').addClass('rounds');
  }
});
                
//                                 var navPlace8 = $('#trends-4-types').waypoint({
//   handler: function(direction) {
//             if(direction === 'down'){
//               //all above
//               $('#trends-nav').removeClass('connection').removeClass('geo').removeClass('rounds');
//             }
//             $('#trends-nav').addClass('types');
//   }
// });




    console.dir(Waypoint);
  },

  numberWithCommas: function (x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },

  renderChart: function () {
    // We can't render the chart while the investments (all the investments
    // data that is, not the ones for the chart) are fetching because it slows
    // the rendering down terribly.
    if (this.props.fetchingGeneralInvestments) {
      return null;
    } else {
      return <ChartNetwork className='home-network-map' investments={this.props.connectedInvestments.items} />;
    }
  },
  renderStats: function (){
    if (this.props.totalNumbers.data == null){
      return null;
    } else {
      let total = this.props.totalNumbers.data;

      var totalB = Math.round(total.impact_investments / '1e8') / 10;
      var totalCompany = this.numberWithCommas(total.impact_companies);
      var totalInvestor = this.numberWithCommas(total.impact_investors);

      return (
      <ul>
        <li><label for="investors-value">Investors</label><div className="investors-value">{totalInvestor}</div></li>
        <li><label for="investments-value">Investments</label><div>{totalB}<span className="investments-monetary-denomination">billion</span></div></li>
        <li><label for="companies-value">Companies</label><div>{totalCompany}</div></li>
      </ul>
      );
    }
  },
  render: function () {
    let {investments} = this.props;
    let totInvestors = pluckUnique(investments, 'investor_id').length;
    let totCompanies = pluckUnique(investments, 'company_id').length;

    let totalB = _.reduce(investments, function (total, o) {
      return total + (parseFloat(o.raised, 10) || 0);
    }, 0);

    totalB = Math.round(totalB / '1e9');

    return (
        <div id="masterScene" className="landing-page scene">
          <Header />

          <div className="width-constrain">
            <div className="landing-title">
              <h1>Building the Network</h1>

            </div>
            <div className="landing-context">
              <p className="landing-text">See relationships between social enterprises & impact investors.</p>
              <p>
              <Link to='/#trends-1-connection'>
              <button>discover insights</button>
              </Link>
              <Link to='/explore'>
              <button>explore network</button>
              </Link>
              </p>
            </div>
            <div className="landing-details">              
                {this.renderStats()}
            </div>
          </div>
          <div className="holder-layer">
            <div className="layer top-layer" data-depth="1.00">
                <img src="./assets/graphics/home/top1.png" alt="flake"></img>
            </div>
          </div>
          <div className="holder-layer">
            <div className="layer mid-layer" data-depth=".70">
                <img src="./assets/graphics/home/mid1.png" alt="flake"></img>
            </div>
          </div>
          <div className="holder-layer">
            <div className="layer btm-layer" data-depth=".30">
                <img src="./assets/graphics/home/btm1.png" alt="flake"></img>
            </div>
          </div>
        </div>
    );
  }
});

// /////////////////////////////////////////////////////////////////// //
// Connect functions

function selector (state) {
  return {
    connectedInvestments: state.connectedInvestments,    
    totalNumbers: state.totalNumbers,
    investments: state.investments.items,
    fetchingGeneralInvestments: state.investments.fetching
  };
}

module.exports = connect(selector)(Home);


//
//<div className='landing-context'>
//  <h1 className='page-title'>Business drives social change</h1>
//  <p className='page-description'>Discover the networks and connections between the social enterprises and impact investors working together to drive powerful businesses and transformative positive social change globally.</p>
//
//  <p className='trends-link'><Link to='/trends/connectedness' className='bttn bttn-base-secondary'>Start with Market Insights</Link></p>
//  <p className='explore-link'><Link to='/explore'>Skip to explore map</Link></p>
//
//  <ul className='stats-list'>
//    <li>
//      <dl>
//        <dt className='key'>Investors</dt>
//        <dd className='value'>{totInvestors || '000'}</dd>
//      </dl>
//    </li>
//    <li>
//      <dl>
//        <dt className='key'>Investments</dt>
//        <dd className='value'>${totalB || '00'} <small className='unit'>BILLION</small></dd>
//      </dl>
//    </li>
//    <li>
//      <dl>
//        <dt className='key'>Companies</dt>
//        <dd className='value'>{totCompanies || '000'}</dd>
//      </dl>
//    </li>
//  </ul>
//
//</div>
//
//{this.renderChart()}
