'use strict';
import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import classNames from 'classnames';
import moment from 'moment';
import { Link } from 'react-router';
import { pushPath } from 'redux-simple-router';

// action creators
import { fetchInvestor, setInvestorTab, fetchInvestorDetails } from '../actions/action-creators';

// React components
import ChartNetwork from '../components/charts/network-map';
import NetworkMapPopoverContent from '../components/network-map-popover-content';
import NetworkMapLegend from '../components/network-map-legend';
import Header from '../components/header';


//utility
import pluckUnique from '../utils/pluck-unique';
import { formatCurrency } from '../utils/numbers';

var Investor = React.createClass({
  propTypes: {
    dispatch: React.PropTypes.func,
    location: React.PropTypes.object,
    params: React.PropTypes.object,
    investor: React.PropTypes.object,
    activeTab: React.PropTypes.string,
    investments: React.PropTypes.array,
    isLoadingInvestments: React.PropTypes.bool,
    isLoading: React.PropTypes.bool
  },

  perPage: 20,

  getId: function () {
    let id = parseInt(this.props.params.investorId, 10);
    return !id ? null : id;
  },

  getCurrPage: function () {
    return parseInt(this.props.location.query.page, 10) || 1;
  },

  componentDidMount: function () {
    let investorId = this.getId();
    if (investorId) {
        // TODO: roll into one request
      this.props.dispatch(fetchInvestor(investorId));
      this.props.dispatch(fetchInvestorDetails(investorId));
    }
  },

  componentDidUpdate: function (prevProps) {
    if (prevProps.params.investorId !== this.props.params.investorId) {
      let investorId = this.getId();
      if (investorId) {
        this.props.dispatch(fetchInvestor(investorId));
      }
    }
  },

  componentWillUnmount: function () {
    this.props.dispatch(setInvestorTab('overview'));
  },

  popoverContentFn: function (d) {
    let investorId = this.getId();
    let investments = this.props.investments;
    let {investor} = this.props;
    // Main investor.
    if (d.type === 'investor' && d._id === investorId) {
      let filtered = _(investments)
        .filter('investor_id', investorId)
        .sortBy('funded_at');

      let lastInv = filtered.last();
      let total = filtered.sum('raised');

      return (
        <NetworkMapPopoverContent
          type={d.type}
          name={d.name}
          lastInvestment={`Last investment made on ${moment(lastInv.funded_at).format('MMM. Do, YYYY')}`}
          total={total ? `$${formatCurrency(total)}` : `--`}
          totalNote='Total amount invested' />
      );
    }
    // Companies.
    if (d.type === 'company') {
      let filtered = _(investments)
        .filter(o => o.investor_id === investorId && o.company_id === d._id)
        .sortBy('funded_at');

      let lastInv = filtered.last();
      let total = filtered.sum('raised');
      return (
        <NetworkMapPopoverContent
          type={d.type}
          name={d.name}
          lastInvestment={`Last investment received on ${moment(lastInv.funded_at).format('MMM. Do, YYYY')}*`}
          total={total ? `$${formatCurrency(total)}` : `--`}
          totalNote='Amount received*'
          footNote={`* In relation to ${investor.name}`} />
      );
    }
    // 2nd level investors.
    if (d.type === 'investor' && d._id !== investorId) {
      return (
        <NetworkMapPopoverContent
          type={d.type}
          name={d.name} />
      );
    }
  },

  networkMapNodeClickHandler: function (d) {
    this.props.dispatch(pushPath(`/${d.type}/${d._id}`));
  },

  tabClickHandler: function (tab, e) {
    e.preventDefault();
    this.props.dispatch(setInvestorTab(tab));
  },

  filterInvestments: function () {
    let investorId = this.getId();
    let investments = this.props.investments;

    return _(investments)
      .filter('investor_id', investorId)
      .groupBy('company_name')
      .values()
      .sortBy('0.company_name')
      .value();
  },

  renderNetworkMap: function (filtered) {
    console.time('renderNetworkMap');
    let investorId = this.getId();
    let {investments} = this.props;
    let page = this.getCurrPage();
    // Slice the data.
    let startPos = this.perPage * (page - 1);
    let endPos = Math.min(startPos + this.perPage, filtered.length);

    let slice = _(filtered)
      .flatten()
      .value();

  /*  let slice = _(filtered)
      .slice(startPos, endPos)
      .flatten()
      .value(); */

    let cids = pluckUnique(slice, 'company_id');
    let secondDegree = _(cids)
      .map(id => {
        return _(investments)
          .filter(o => o.company_id === id && o.investor_id !== investorId)
          .take(5)
          .value();
      })
      .flatten()
      .value();
    console.timeEnd('renderNetworkMap');

    let chartData = slice.concat(secondDegree);
    return <ChartNetwork mainNodeIds={`i${investorId}`} investments={chartData} popoverContentFn={this.popoverContentFn} nodeClickHandler={this.networkMapNodeClickHandler} />;
  },

  renderSimilarInvestors: function(filtered, investorId) {
    //let similarInvestors = _.map(filteredInvestments, (simInvestorInvestments, i) => {
    //    //return simInvestorInvestments[0].
    //    console.log(i);
    //})

      let {investments} = this.props;
      //let page = this.getCurrPage();
      // Slice the data.
      //let startPos = this.perPage * (page - 1);
      //let endPos = Math.min(startPos + this.perPage, filtered.length);
      let slice = _(filtered)
          //.slice(startPos, endPos)
          .flatten()
          .value();



      let cids = pluckUnique(slice, 'company_id');
      let secondDegree = _(cids)
          .map(id => {
              return _(investments)
                  .filter(o => o.company_id === id && o.investor_id !== investorId)
                  .take(5)
                  .value();
          })
          .flatten()
          .value();

      let similar = [];
      let arr_similar_investors = [];

      secondDegree.map((investment) => {
          var name = investment.investor_name;
          var invID = investment.investor_id;
          var url = `/investor/${invID}`;

          arr_similar_investors.push({url: url, name: name});
          //similar.push(<Link to={url}><li>{name}</li></Link>)
      });

      arr_similar_investors = _.sortBy(arr_similar_investors, "name");
      for (var i in arr_similar_investors){
        var obj_investor = arr_similar_investors[i];
        similar.push(<Link to={obj_investor.url}><li>{obj_investor.name}</li></Link>);
      }

      console.log("Similar Investors", arr_similar_investors);
      console.log("SECOND DEGREE investor array", similar);

      return similar;
  },

  renderInvestments: function (filtered) {
    let {investments, isLoadingInvestments} = this.props;
    let investorId = this.getId();
    if (!investments || isLoadingInvestments) {
      return (
        <div>
          <h2 className='section-title'>Rounds participated in</h2>
          <p>Data is is loading</p>
        </div>
      );
    }

    if (!filtered.length) {
      return (
        <div>
          <h2 className='section-title'>Rounds participated in</h2>
          <p>There are no investments for this investor</p>
        </div>
      );
    }

    let totalInvestments = _.sum(filtered, o => o.length);

    let page = this.getCurrPage();
    let maxPage = Math.ceil(filtered.length / this.perPage);

    let isPrevPage = page > 1;
    let isNextPage = page < maxPage;

    // Slice the data.
    let startPos = this.perPage * (page - 1);
    let endPos = Math.min(startPos + this.perPage, filtered.length);
    let slice = _.slice(filtered, startPos, endPos);

    return (
      <div>
        <h2 className='section-title'>Rounds participated in:<small className='badge'>{totalInvestments}</small></h2>
        <dl className='inv-list'>
          {_.map(slice, (o) => {
            let res = [];
            res.push(<dt className='inv-name' key={`dt-${o[0].company_id}`}><Link to={`/company/${o[0].company_id}`}>{o[0].company_name || 'No name'}</Link></dt>);
            res.push(
              <dd key={`dd-${o[0].company_id}`}>
                <ol>
                  {_.map(o, (oo) => {
                    let date = moment(oo.funded_at).format('MMM. Do, YYYY');
                    let amount = oo.raised ? ` -- $${formatCurrency(oo.raised)}` : '';
                    let round = oo.funding_round_code ? ` / ${oo.funding_round_code}` : '';
                    return (
                      <li key={`inv-${oo.id}`}>{date}{amount}{round}</li>
                    );
                  })}
                </ol>
              </dd>
            );
            return res;
          })}
        </dl>
        {isPrevPage || isNextPage ? (
        <ul className='bttn-group bttn-group-s pagination'>
          <Link to={`/investor/${investorId}?page=${page - 1}`} className={classNames({disabled: !isPrevPage})}><li className='bttn-stats-prev'>prev</li></Link>
          <Link to={`/investor/${investorId}?page=${page + 1}`} className={classNames({disabled: !isNextPage})}><li className='bttn-stats-next'>next</li></Link>
        </ul>
        ) : null }
      </div>
    );
  },

  renderTabContent: function (tab, filteredInvestments) {
    let {investor, investorDetails} = this.props;


    // hack to get 3 related investors;
    console.log("FILTERED INVESTMENTS", filteredInvestments);

    switch (tab) {
      case 'overview':
        return (
          <div className="overview">
            <h2 className='section-title'>Investor</h2>

            <h1 className='company-name'>{investor.name}</h1>
             <ul className='investor-tabs'>
                  <li className='active'><a href='#' onClick={this.tabClickHandler.bind(null, 'overview')}>overview</a></li>
                  <li><a href='#' onClick={this.tabClickHandler.bind(null, 'details')}>details</a></li>
            </ul>
            {investor.overview ? (
              <p>{investor.overview}</p>
            ) : (
              investor.mission_statement ? <p>{investor.mission_statement}</p> : null
            )}
            {investor.top_sector ? (<p><strong>Sector</strong> {investor.top_sector}</p>) : null}
            {investor.people.length ? (<p><strong>Team</strong> {_.pluck(investor.people, 'name').join(', ')}</p>) : null}

            {this.renderInvestments(filteredInvestments)}
          </div>
        );
      case 'details':
        return (
          <div className="details">
            <h2 className='section-title'>Investor</h2>
            <h1 className='company-name'>{investor.name}</h1>
            <ul className='investor-tabs'>
                  <li><a href='#' onClick={this.tabClickHandler.bind(null, 'overview')}>overview</a></li>
                  <li className='active'><a href='#' onClick={this.tabClickHandler.bind(null, 'details')}>details</a></li>
            </ul>
            <p className='sub-head'>issue areas most frequently invested in</p>
            <p className='top-sector'>{investorDetails.top_three_sectors[0]}
                {investorDetails.top_three_sectors[1]}
                {investorDetails.top_three_sectors[2]}</p>
            <p className='sub-head'>investor approach</p>
            <p className='inv-approach'>Geography</p>
            <p className='inv-approach-detail'>{investorDetails.continent_approach ? (investorDetails.continent_approach ) : "Less diversified"  }</p>
            <p className='inv-approach'>impact objective</p>
            <p className='inv-approach-detail'>{investorDetails.sector_approach ? (investorDetails.sector_approach ) : "Less diversified"  }</p>
            <h2 className='section-title'>Connected Investors</h2>
              <ul>
              {this.renderSimilarInvestors(filteredInvestments, investor.id )}
                </ul>
          </div>
        );
    }
  },

  render: function () {
    console.log('render');
    let {investor, isLoading, investments, investorDetails, isDetailsLoading,
        isLoadingInvestments, activeTab} = this.props;
    let filteredInvestments = this.filterInvestments();

    return (
      <div className='flex-wrapper page-detail-investor'>
      <Header />

        <div className='investor-page-wrapper'>
          <div className='content-data'>
          <div className='sec-nav-bar'>
          <div className='inner'>
            <ul className='action-menu'>
              <li>
                <a href='#/explore' className='btn-back'>Back to list exploration</a>
              </li>
            </ul>
          </div>
        </div>
           {investor && !isLoading && investorDetails && !isDetailsLoading ? (
              <div className='inner prose'>
                {this.renderTabContent(activeTab, filteredInvestments)}
              </div>
              ) : (
              <div className='inner prose'>
                <p>Data is isLoading</p>
              </div>
              )}
          </div>

          <div className='content-infographic'>
          <div className='explore-key'>
            <ul>
              <li>Investor</li>
              <li>Company</li>
              <li>Investment Made</li>
              <div></div>
              <li>Fewer Investments</li>
              <li>More Investments</li>
              <li>Featured At Left</li>
            </ul>
          </div>
            <div className='inner'>
              <NetworkMapLegend listed='investor' />
              {investments && !isLoadingInvestments ? this.renderNetworkMap(filteredInvestments) : null}
            </div>
            <div className="holder-layer">
            <div className="layer top-layer" data-depth="1.00">
                <img src="./assets/graphics/explorebg2.svg" alt="flake"></img>
            </div>
          </div>
          <div className="holder-layer">
            <div className="layer mid-layer" data-depth=".70">
                <img src="./assets/graphics/explorebg.svg" alt="flake"></img>
            </div>
          </div>
          </div>
        </div>
      </div>
    );
  }
});


 // <ul className='investor-tabs'>
 //                  <li className={classNames({active: activeTab === 'overview'})}><a href='#' onClick={this.tabClickHandler.bind(null, 'overview')}>overview</a></li>
 //                  <li className={classNames({active: activeTab === 'details'})}><a href='#' onClick={this.tabClickHandler.bind(null, 'details')}>details</a></li>
 //            </ul>

// /////////////////////////////////////////////////////////////////// //
// Connect functions

function selector (state) {
  return {
    investments: state.investments.items,
    isLoadingInvestments: state.investments.fetching,
    investor: state.investor.data,
    activeTab: state.investor.activeTab,
    isLoading: state.investor.fetching,
    investorDetails: state.investorDetails.data,
    isDetailsLoading: state.investorDetails.fetching
  };
}

module.exports = connect(selector)(Investor);

//
//<dl>
//    <dt className='inv-name'><a href=''>Kholsa Ventures</a></dt>
//    <dt className='inv-name'><a href=''>Collaborative Fund</a></dt>
//    <dt className='inv-name'><a href=''>SV Angel</a></dt>
//</dl>
