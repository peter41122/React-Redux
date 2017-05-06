'use strict';
import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import classNames from 'classnames';
import moment from 'moment';
import { Link } from 'react-router';
import { pushPath } from 'redux-simple-router';
import { fetchCompany, setCompanyTab } from '../actions/action-creators';
import ChartNetwork from '../components/charts/network-map';
import NetworkMapPopoverContent from '../components/network-map-popover-content';
import pluckUnique from '../utils/pluck-unique';
import NetworkMapLegend from '../components/network-map-legend';
import { formatCurrency } from '../utils/numbers';
import Header from '../components/header';

var Comapny = React.createClass({
  propTypes: {
    dispatch: React.PropTypes.func,
    location: React.PropTypes.object,
    params: React.PropTypes.object,
    company: React.PropTypes.object,
    investments: React.PropTypes.array,
    isLoadingInvestments: React.PropTypes.bool,
    isLoading: React.PropTypes.bool,
    activeTab: React.PropTypes.string
  },

  perPage: 10,

  getId: function () {
    let id = parseInt(this.props.params.companyId, 10);
    return !id ? null : id;
  },

  getCurrPage: function () {
    return parseInt(this.props.location.query.page, 10) || 1;
  },

  componentDidMount: function () {
    let companyId = this.getId();
    if (companyId) {
      this.props.dispatch(fetchCompany(companyId));
    }
  },

  componentDidUpdate: function (prevProps) {
    if (prevProps.params.companyId !== this.props.params.companyId) {
      let companyId = this.getId();
      if (companyId) {
        this.props.dispatch(fetchCompany(companyId));
      }
    }
  },

  popoverContentFn: function (d) {
    let companyId = this.getId();
    let investments = this.props.investments;
    let company = this.props.company;
    // Main company.
    if (d.type === 'company' && d._id === companyId) {
      let filtered = _(investments)
        .filter('company_id', companyId)
        .sortBy('funded_at');

      let lastInv = filtered.last();
      let total = filtered.sum('raised');

      return (
        <NetworkMapPopoverContent
          type={d.type}
          name={d.name}
          lastInvestment={`Last investment received on ${moment(lastInv.funded_at).format('MMM. Do, YYYY')}`}
          total={total ? `$${formatCurrency(total)}` : `--`}
          totalNote='Total amount received' />
      );
    }
    // Investors.
    if (d.type === 'investor') {
      let filtered = _(investments)
        .filter(o => o.company_id === companyId && o.investor_id === d._id)
        .sortBy('funded_at');

      let lastInv = filtered.last();
      let total = filtered.sum('raised');
      return (
        <NetworkMapPopoverContent
          type={d.type}
          name={d.name}
          lastInvestment={`Last investment made on ${moment(lastInv.funded_at).format('MMM. Do, YYYY')}*`}
          total={total ? `$${formatCurrency(total)}` : `--`}
          totalNote='Amount invested*'
          footNote={`* In relation to ${company.name}`} />
      );
    }
    // 2nd level companies.
    if (d.type === 'company' && d._id !== companyId) {
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

  filterInvestments: function () {
    let companyId = this.getId();
    let investments = this.props.investments;

    return _(investments)
      .filter('company_id', companyId)
      .groupBy('investor_name')
      .values()
      .sortBy('0.investor_name')
      .value();
  },

  renderNetworkMap: function (filtered) {
    console.time('renderNetworkMap');
    let companyId = this.getId();
    let {investments} = this.props;
    let page = this.getCurrPage();
    // Slice the data.
    let startPos = this.perPage * (page - 1);
    let endPos = Math.min(startPos + this.perPage, filtered.length);
    /* let slice = _(filtered)
      .slice(startPos, endPos)
      .flatten()
      .value(); */
    let slice = _(filtered)
      .slice(0, filtered.length)
      .flatten()
      .value();

    let iids = pluckUnique(slice, 'investor_id');
    let secondDegree = _(iids)
      .map(id => {
        return _(investments)
          .filter(o => o.investor_id === id && o.company_id !== companyId)
          .take(5)
          .value();
      })
      .flatten()
      .value();
    console.timeEnd('renderNetworkMap');

    let chartData = slice.concat(secondDegree);
    return <ChartNetwork mainNodeIds={`c${companyId}`} investments={chartData} popoverContentFn={this.popoverContentFn} nodeClickHandler={this.networkMapNodeClickHandler} />;
  },

  tabClickHandler: function (tab, e) {
    e.preventDefault();
    this.props.dispatch(setCompanyTab(tab));
  },

  renderSimilarCompanies: function(filtered){
    let companyId = this.getId();
    let {investments} = this.props;
    // Slice the data.
    let slice = _(filtered)
        .flatten()
        .value();

    let iids = pluckUnique(slice, 'investor_id');
    let secondDegree = _(iids)
        .map(id => {
          return _(investments)
              .filter(o => o.investor_id === id && o.company_id !== companyId)
              .take(5)
              .value();
        })
        .flatten()
        .value();

    console.log("WHAT DO WE HAVE HERE?", secondDegree);

    let similar = [];
    let arr_similar_companies = [];
    let noDupes = []; // if a name is in here, don't render

    secondDegree.map((investment) => {
      if (noDupes.indexOf(investment.company_name) === -1) {
        noDupes.push(investment.company_name);
      } else {
        return;
      }
      var name = investment.company_name;
      var coID = investment.company_id;
      var url = `/investor/${coID}`;

      arr_similar_companies.push({url: url, name: name});
     // similar.push(<Link to={url}><dt className='inv-name'>{name}</dt></Link>)
    });

     arr_similar_companies = _.sortBy(arr_similar_companies, "name");
      for (var i in arr_similar_companies){
        var obj_company = arr_similar_companies[i];
        similar.push(<Link to={obj_company.url}><dt className='inv-name'>{obj_company.name}</dt></Link>);
      }
    console.log("SECOND DEGREE investor array", similar);

    return similar;
  },

  renderInvestments: function (filtered) {
    let {investments, isLoadingInvestments} = this.props;
    let companyId = this.getId();
    if (!investments || isLoadingInvestments) {
      return (
        <div>
          <h2 className='section-title'>Investments</h2>
          <p>Data is is loading</p>
        </div>
      );
    }

    if (!filtered.length) {
      return (
        <div>
          <h2 className='section-title'>Investments</h2>
          <p>There are no investments for this company</p>
        </div>
      );
    }

    let totalInvestors = _.sum(filtered, o => o.length);

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
        <h2 className='section-title'>Investors <small className='badge'>{totalInvestors}</small></h2>
        <dl className='inv-list'>
          {_.map(slice, (o) => {
            let res = [];
            res.push(<dt className='inv-name' key={`dt-${o[0].investor_id}`}><Link to={`/investor/${o[0].investor_id}`}>{o[0].investor_name || 'No name'}</Link></dt>);
            res.push(
              <dd key={`dd-${o[0].investor_id}`}>
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
          <Link to={`/company/${companyId}?page=${page - 1}`} className={classNames({disabled: !isPrevPage})}><li className='bttn-stats-prev'>prev</li></Link>
          <Link to={`/company/${companyId}?page=${page + 1}`} className={classNames({disabled: !isNextPage})}><li className='bttn-stats-next'>next</li></Link>
        </ul>
        ) : null }
      </div>
    );
  },

  renderTabContent: function(tab, filteredInvestments){
    let {company} = this.props;
    switch (tab) {
      case 'overview':
        return (
            <div className="company-overview">
              {company.overview ? (
                  <p><strong>Overview:</strong>{company.overview}</p>
              ) : (
                  company.mission_statement ? <p><strong>Mission:</strong>{company.mission_statement}</p> : null
              )}
              {company.top_sector ? (<p><strong>Sector:</strong> {company.top_sector}</p>) : null}
              {company.people.length ? (<p><strong>Team:</strong> {_.pluck(company.people, 'name').join(', ')}</p>) : null}

              {this.renderInvestments(filteredInvestments)}
            </div>
        );
      case 'details':
        return (
            <div className="company-details">

              {company.twitter.length>1 ? (
                  <div><p className='sub-head'>Twitter</p>
                  <a href={"https://www.twitter.com/" + company.twitter} target="_blank" className="no-decor"><p className='twitter'>{company.twitter}</p></a>
                  </div>
                  ):null
              }

              
              <h2 className='section-title'>Connected Companies</h2>
              <dl>
                {this.renderSimilarCompanies(filteredInvestments)}
              </dl>
            </div>
        );
        //<p className='sub-head'>Employees</p>
        //<p className='size'> 24 </p>
    }
  },

  render: function () {
    let {company, isLoading, investments, isLoadingInvestments, activeTab} = this.props;
    let filteredInvestments = this.filterInvestments();
    return (
      <div className='flex-wrapper company-page-container'>


        <div className='company-page-wrapper'>
        <Header />
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
            {company && !isLoading ? (
            <div className='inner prose'>
              <h2 className='section-title'>Company</h2>
              <h1 className='company-name'>{company.name}</h1>
              <ul className='company-tabs'>
                  <li className='active'><a href='#' onClick={this.tabClickHandler.bind(null, 'overview')}>overview</a></li>
                  <li><a href='#' onClick={this.tabClickHandler.bind(null, 'details')}>details</a></li>
            </ul>


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
              <NetworkMapLegend listed='company' />
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

//             <ul className='company-tabs'>
//              <li className={classNames({active: activeTab === 'overview'})}><a href='#' onClick={this.tabClickHandler.bind(null, 'overview')}>overview</a></li>
//              <li className={classNames({active: activeTab === 'details'})}><a href='#' onClick={this.tabClickHandler.bind(null, 'details')}>details</a></li>
//            </ul>
// 

// /////////////////////////////////////////////////////////////////// //
// Connect functions

function selector (state) {
  return {
    investments: state.investments.items,
    isLoadingInvestments: state.investments.fetching,
    company: state.company.data,
    isLoading: state.company.fetching,
    activeTab: state.company.activeTab
  };
}

module.exports = connect(selector)(Comapny);
