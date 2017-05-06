'use strict';
import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import classNames from 'classnames';
import moment from 'moment';
import { batchActions } from 'redux-batched-actions';
import { pushPath } from 'redux-simple-router';
import { Link } from 'react-router';
import { setExploreFilters, setExploreTableSort } from '../actions/action-creators';
import NlForm from '../components/nl-form';
import NlFormController from '../utils/nl-form-controller';
import pluckUnique from '../utils/pluck-unique';
import ChartNetwork from '../components/charts/network-map';
import NetworkMapPopoverContent from '../components/network-map-popover-content';
import NetworkMapLegend from '../components/network-map-legend';
import { formatCurrency } from '../utils/numbers';
import Header from '../components/header';
import SearchBar from '../components/search-bar';

var nlFormController = new NlFormController('I am looking for {%type%} in {%sector%} in {%geography%}');

var Explore = React.createClass({
  propTypes: {
    dispatch: React.PropTypes.func,
    location: React.PropTypes.object,
    investments: React.PropTypes.array,
    // explore: {obj, bool, {string, string}}
    explore: React.PropTypes.shape({
      nlForm: React.PropTypes.object,
      isLoading: React.PropTypes.bool,
      sort: React.PropTypes.shape({
        field: React.PropTypes.string,
        order: React.PropTypes.string
      })
    })
  },

  // componentDidMount: function () {
  //   var scene2 = document.getElementById('scene-explore');
  //   var parallax2 = new Parallax(scene2);
  // },
  componentDidMount: function(){
   
  },
  componentDidUpdate: function(){
   /* this.filters = null;
    var query = this.getQuery();
    if (query) {
      this.filters = {};
      this.filters.geography = (query.geography)?query.geography:'all';
      this.filters.sector = (query.sector)?query.sector:'all';
      this.filters.type = (query.type)?query.type:'investors';
    } */
  },
  getQuery: function() {
    /*
    * type = company | investor
    * issue = issue_name
    * geography = geography_name
    */
    return this.props.location.query;
  },

  setupNlForm: function () {
    let {nlForm} = this.props.explore;

    var query = this.getQuery();
    
    if (query != null){
      nlForm.activeOpts.sector = (query.sector)?query.sector:nlForm.activeOpts.sector;
      nlForm.activeOpts.type = (query.type)?query.type:nlForm.activeOpts.type;
      nlForm.activeOpts.geography = (query.geography)?query.geography:nlForm.activeOpts.geography;

      this.props.location.query = null;
    }

    nlFormController.setFields([
      {
        id: 'type',
        active: nlForm.activeOpts.type,
        opts: nlForm.fieldOpts.type
      },
      {
        id: 'sector',
        active: nlForm.activeOpts.sector,
        opts: nlForm.fieldOpts.sector
      },
      {
        id: 'geography',
        active: nlForm.activeOpts.geography,
        opts: nlForm.fieldOpts.geography
      }
    ]);


  },

  /**
   * Listener: Change on nlForm options.
   */
  onNlSelect: function (selection) {
    this.props.dispatch(batchActions([
      pushPath('/explore'),
      setExploreFilters(selection)
    ]));
  },

  sortLinkClickHandler: function (field, e) {
    e.preventDefault();
    let {field: sortField, order: sortOrder} = this.props.explore.sort;
    let order = 'asc';
    // Same field, switch order.
    if (sortField === field) {
      order = sortOrder === 'asc' ? 'desc' : 'asc';
    }
    // Different field, reset order.

    console.log("U R HERE");

    this.props.dispatch(batchActions([
      pushPath('/explore'),
      setExploreTableSort(field, order)
    ]));
  },

  perPage: 15,

  getCurrPage: function () {
    return parseInt(this.props.location.query.page, 10) || 1;
  },

   // SORT OF THE EXPLORE CONTROLLER
  processTableData: function () {
    let {investments} = this.props;

    let {activeOpts: {type: typeFilter, sector: sectorFilter, geography: geographyFilter}} = this.props.explore.nlForm;

    let {field: sortField, order: sortOrder} = this.props.explore.sort;

    console.log("SORT FIELD: " + sortField);
    console.time('prep investments');
    let _investments = _(investments)
      .filter(o => {
        if (sectorFilter !== 'all' && o.subsector !== sectorFilter) {
          return false;
        }
        if (geographyFilter !== 'all' && o.continent !== geographyFilter) {
          return false;
        }
        return true;
      });

    console.log("PLZ?", _investments);
    let filteredInv = _investments.value();
    let totalInvestors = pluckUnique(filteredInv, 'investor_id').length;
    let totalCompanies = pluckUnique(filteredInv, 'company_id').length;
    let sortMap;

    // INVESTORS
    if (typeFilter === 'investors') {
      sortMap = {
        'name': 'investorName',
        'amount-invest': 'totalAmout',
        'total-investments': 'totalCompanies',
        'last-investment': 'lastCompany',
        'num-invest': 'totalInvestments'
      };

      _investments = _investments
        .groupBy('investor_id')
        .map((o, k) => {
          let totalCompanies = pluckUnique(o, 'company_id').length;

          let totalAmout = _.sum(o, d => d.raised === '' ? 0 : parseFloat(d.raised, 10));
          let lastDate = _(o)
            .sortBy('funded_at')
            .last();

          let investment = {
            investorId: o[0].investor_id,
            investorName: _.trim(o[0].investor_name || 'name n/a'),
            totalAmout: totalAmout,
            totalInvestments: o.length,
            totalCompanies: totalCompanies,
            lastCompany: lastDate.company_name,
            lastCompanyId: lastDate.company_id
          };

          return investment;
        });
    }
    // COMPANIES
    else {
      sortMap = {
        'name': 'companyName',
        'amount-invest': 'totalAmout',
        'total-investments': 'totalInvestors',
        'last-investment': 'lastInvestor',
        'num-invest': 'totalInvestments'
      };

      _investments = _investments
        .groupBy('company_id')
        .map((o, k) => {
          let totalInvestors = pluckUnique(o, 'investor_id').length;

          let totalAmout = _.sum(o, d => d.raised === '' ? 0 : parseFloat(d.raised, 10));
          let lastDate = _(o)
            .sortBy('funded_at')
            .last();

          let investment = {
            companyId: o[0].company_id,
            companyName: _.trim(o[0].company_name || 'name n/a'),
            totalAmout: totalAmout,
            totalInvestments: o.length,
            totalInvestors: totalInvestors,
            lastInvestor: lastDate.investor_name,
            lastInvestorId: lastDate.investor_id
          };

          return investment;
        });
    }
    _investments = _investments.value();

    _investments.sort((a, b) => {
      let _a = a[sortMap[sortField]];
      let _b = b[sortMap[sortField]];
      if (_a.localeCompare) {
        return _a.localeCompare(_b);
      }
      return _a < _b ? -1 : (_a > _b ? 1 : 0);
    });

    if (sortOrder === 'desc') {
      _investments.reverse();
    }

    console.timeEnd('prep investments');

    let page = this.getCurrPage();
    let maxPage = Math.ceil(_investments.length / this.perPage);

    let isPrevPage = page > 1;
    let isNextPage = page < maxPage;

    // Slice the data.
    let startPos = this.perPage * (page - 1);
    let endPos = Math.min(startPos + this.perPage, _investments.length);
    let slice = _.slice(_investments, startPos, endPos);

    return {
      page,
      maxPage,
      isPrevPage,
      isNextPage,
      startPos,
      endPos,
      slice,
      totalInvestors,
      totalCompanies,
      investments: _investments,
      filteredInvestments: filteredInv
    };
  },

  renderTableHead: function () {
    let typeFilter = this.props.explore.nlForm.activeOpts.type;
    let {field: sortField, order: sortOrder} = this.props.explore.sort;

    var sortClass = function (name) {
      return classNames('sort', {
        'sort-none': sortField !== name,
        'sort-asc': sortField === name && sortOrder === 'asc',
        'sort-desc': sortField === name && sortOrder === 'desc'
      });
    };

    // var sortUrl = function (name) {
    //   // Same field, switch order.
    //   if (sortField === name) {
    //     return `/explore?sfield=${name}&sorder=${sortOrder === 'asc' ? 'desc' : 'asc'}`;
    //   }
    //   // Different field, reset order.
    //   return `/explore?sfield=${name}&sorder=asc`;
    // };

    let fields;
    if (typeFilter === 'investors') {
      fields = [
        { name: 'name', display: 'Investor or Fund' },
        { name: 'total-investments', display: 'Number of Investments' },
        { name: 'last-investment', display: 'Last Investment' },
        { name: 'num-invest', display: 'Number of Companies' },
        { name: 'amount-invest', display: 'Value of Rounds Participated In\u00a0($)' }
      ];
    } else {
      fields = [
        { name: 'name', display: 'Company' },
        { name: 'amount-invest', display: 'Total Received\u00a0($)' },
        { name: 'total-investments', display: 'Number of Investments' },
        { name: 'last-investment', display: 'Last Investment' },
        { name: 'num-invest', display: 'Number of Investors' }
      ];
    }
    return (
      <thead>
        <tr>
          <th></th>
          {_.map(fields, f => {
            return <th className={f['name']} key={_.kebabCase(f.display)}><Link to='' onClick={this.sortLinkClickHandler.bind(null, f.name)} className={sortClass(f.name)}>{f.display}</Link></th>;
          })}
        </tr>
      </thead>
    );
  },

  renderTableBody: function (data, page) {
    let typeFilter = this.props.explore.nlForm.activeOpts.type;
    if (typeFilter === 'investors') {
      return (
        <tbody>
          {_.map(data, (o, i) => {
            let no = (page - 1) * this.perPage + i + 1;
            return (
              <tr key={`investor-${o.investorId}`}>
                <td>{no}</td>
                <td className="name"><Link to={`/investor/${o.investorId}`}>{o.investorName}</Link></td>
                <td className="total-investments">{o.totalInvestments}</td>
                <td className="last-investment"><Link to={`/company/${o.lastCompanyId}`}>{o.lastCompany}</Link></td>
                <td className="num-invest">{o.totalCompanies}</td>
                <td className="amount-invest">{o.totalAmout ? `$${formatCurrency(o.totalAmout)}` : `--`}</td>
              </tr>
            );
          })}
        </tbody>
      );
    } else {
      return (
        <tbody>
          {_.map(data, (o, i) => {
            let no = (page - 1) * this.perPage + i + 1;
            return (
              <tr key={`company-${o.companyId}`}>
                <td>{no}</td>
                <td className="name"><Link to={`/company/${o.companyId}`}>{o.companyName}</Link></td>
                <td className="amount-invest">{o.totalAmout ? `$${formatCurrency(o.totalAmout)}` : `--`}</td>
                <td className="total-investments">{o.totalInvestments}</td>
                <td className="last-investment"><Link to={`/investor/${o.lastInvestorId}`}>{o.lastInvestor}</Link></td>
                <td className="num-invest">{o.totalInvestors}</td>
              </tr>
            );
          })}
        </tbody>
      );
    }
  },

  renderContent: function (data) {
    this.setupNlForm();

    let {slice, page, isPrevPage, isNextPage, totalInvestors, totalCompanies} = data;

    return (
      <div className='inner'>
        <p className='page-description-form negative'>
          <NlForm sentence={nlFormController.getSentence()} fields={nlFormController.getFields()} onNlSelect={this.onNlSelect} />
        </p>
        <h2 className='page-sec-deck'>This data shows <strong>{totalInvestors}</strong> investors or funds investing in <strong>{totalCompanies}</strong> companies.</h2>
        <p className='disclaimer'>*Disclaimer Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque interdum rutrum sodales. Nullam mattis fermentum libero. Lorem ipsum dolor sit amet. Pellentesque interdum rutrum sodales. Nullam mattis fermentum libero, non volutpa.</p>
        {!slice.length ? (
          <p>There is no data to show</p>
        ) : (
          <div>
          <table className='table'>
            {this.renderTableHead()}
            {this.renderTableBody(slice, page)}
          </table>
          {isPrevPage || isNextPage ? (
          <ul className='bttn-group pagination'>
            <div className='blur-back'></div>
            <Link to={`/explore?page=${page - 1}`} className={classNames({disabled: !isPrevPage})}><li className='bttn-stats-prev'>prev</li></Link>
            <Link to={`/explore?page=${page + 1}`} className={classNames({disabled: !isNextPage})}><li className='bttn-stats-next'>next</li></Link>
          </ul>
          ) : null}
          <SearchBar />
        </div>
        )}
      </div>
    );
  },

  renderNetworkMap: function (data) {
    let {slice, filteredInvestments} = data;
    let typeFilter = this.props.explore.nlForm.activeOpts.type;

    console.time('Reduce investments');
    let reducedInvestments = _(filteredInvestments)
      .groupBy(o => `${o.investor_id}-${o.company_id}`)
      .values()
      .map(o => _.reduce(o, (result, obj, key) => {
        obj.raised = +(obj.raised);
        if (result === null) {
          return _.cloneDeep(obj);
        }

        result.raised += parseFloat(obj.raised, 10);
        result.funded_at = result.funded_at < obj.funded_at ? obj.funded_at : result.funded_at;

        return result;
      }, null))
      .value();
    console.timeEnd('Reduce investments');

    let iids;
    let sources;
    let mainIids;
    let type;
    if (typeFilter === 'investors') {
      type = 'investor';
      // The chart data starts from the ones shown in the table;
      iids = pluckUnique(slice, 'investorId');
      // Prepare the starting point for the degreesSeparation;
      sources = _.map(iids, o => { return {investor_id: o}; });
      // Ids for the highlighting.
      mainIids = _.map(iids, o => `i${o}`);
    } else {
      type = 'company';
      // The chart data starts from the ones shown in the table;
      iids = pluckUnique(slice, 'companyId');
      // Prepare the starting point for the degreesSeparation;
      sources = _.map(iids, o => { return {company_id: o}; });
      // Ids for the highlighting.
      mainIids = _.map(iids, o => `c${o}`);
    }

    let res = degreesSeparation(reducedInvestments, 2, sources, type);

    return <ChartNetwork mainNodeIds={mainIids} exploreType={type} investments={res} popoverContentFn={this.popoverContentFn.bind(this, reducedInvestments)} nodeClickHandler={this.networkMapNodeClickHandler} />;
  },

  popoverContentFn: function (reducedInvestments, d) {
    let typeFilter = this.props.explore.nlForm.activeOpts.type;
    if (typeFilter === 'investors') {
      // Main investor.
      if (d.type === 'investor' && d.main) {
        let filtered = _(reducedInvestments)
          .filter('investor_id', d._id)
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
      // Non main Companies.
      if (d.type === 'company' && !d.main) {
        let filtered = _(reducedInvestments)
          .filter('company_id', d._id)
          .sortBy('funded_at');

        let lastInv = filtered.last();
        let total = filtered.sum('raised');
        return (
        <NetworkMapPopoverContent
          type={d.type}
          name={d.name}
          lastInvestment={`Last investment received on ${moment(lastInv.funded_at).format('MMM. Do, YYYY')}`}
          total={total ? `$${formatCurrency(total)}` : `--`}
          totalNote='Amount received' />
        );
      }
      // 2nd level investors.
      if (d.type === 'investor' && !d.main) {
        return (
        <NetworkMapPopoverContent
          type={d.type}
          name={d.name} />
        );
      }
    } else {
      // Main company.
      if (d.type === 'company' && d.main) {
        let filtered = _(reducedInvestments)
          .filter('company_id', d._id)
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
      // Non main Investors.
      if (d.type === 'investor' && !d.main) {
        let filtered = _(reducedInvestments)
          .filter('investor_id', d._id)
          .sortBy('funded_at');

        let lastInv = filtered.last();
        let total = filtered.sum('raised');
        return (
        <NetworkMapPopoverContent
          type={d.type}
          name={d.name}
          lastInvestment={`Last investment made on ${moment(lastInv.funded_at).format('MMM. Do, YYYY')}`}
          total={total ? `$${formatCurrency(total)}` : `--`}
          totalNote='Amount invested' />
        );
      }
      // 2nd level companies.
      if (d.type === 'company' && !d.main) {
        return (
        <NetworkMapPopoverContent
          type={d.type}
          name={d.name} />
        );
      }
    }
  },

  networkMapNodeClickHandler: function (d) {
    this.props.dispatch(pushPath(`/${d.type}/${d._id}`));
  },

  overlayToggleHandler: function () {
    this.refs.panelWrapper.classList.toggle('hidden-panel');
  },

  render: function () {
    let isLoading = this.props.explore.isLoading;
    let typeFilter = this.props.explore.nlForm.activeOpts.type;

    let data = null;
    if (!isLoading) {
      data = this.processTableData();
    }

    return (
      <div className='flex-wrapper' id='page-explore'>
      <Header />
        <div className='sec-nav-bar'>
        <div className='blur-back'></div>
          <div className='inner'>
            <ul className='action-menu'>
              <li>
                <a href='#/trends/rounds' className='btn-back'>Back to trends</a>
              </li>
            </ul>
              <form className='form-search' ref='searchForm'>
                <div>
                  <div className='input-group'>
                    <input type='search' className='form-control input-search input-m' placeholder='search the network' ref='searchBox' />
                      <span className='input-group-bttn bttn bttn-search'>
                        <a href='#' className='bttn bttn-search' onClick={this.searchClick}><span>Search</span></a>
                      </span>
                  </div>
                  <div className='drop-content search-results'>
                  </div>
                </div>
              </form>
          </div>
        </div>

        <div className='explore-page-wrapper hidden-panel' ref='panelWrapper'>
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
          <div className='flex-wrapper'>
            <button className='content-data-toggle' onClick={this.overlayToggleHandler}><span className='overlay-text'>List</span></button>
            <div className='content-data'>

              {isLoading ? (
                <div className='inner'>
                  <p>Data is loading</p>
                </div>
              ) : this.renderContent(data)}
            </div>
            <div id="scene-explore'" className='content-infographic'>
            <NetworkMapLegend listed={typeFilter === 'investors' ? 'investor' : 'company'} />
            {!isLoading ? this.renderNetworkMap(data) : null}
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

      </div>
    );
  }
});

          // <div className="holder-layer">
          //   <div className="layer mid-layer" data-depth=".70">
          //       <img src="./assets/graphics/home/mid1.png" alt="flake"></img>
          //   </div>
          // </div>
          // <div className="holder-layer">
          //   <div className="layer btm-layer" data-depth=".30">
          //       <img src="./assets/graphics/home/btm1.png" alt="flake"></img>
          //   </div>
          // </div>

// /////////////////////////////////////////////////////////////////// //
// Connect functions

function selector (state) {
  return {
    investments: state.investments.items,
    explore: state.explore
  };
}

module.exports = connect(selector)(Explore);

function degreesSeparation (fullData, degrees, starters, what) {
  const fieldMap = {
    investor: 'investor_id',
    company: 'company_id'
  };
  const flipper = {
    investor: 'company',
    company: 'investor'
  };

  if (!_.isArray(starters)) {
    starters = [starters];
  }
  // 'starters' are only used to get the process going and need to be removed in
  // the end. This would be a problem if they had no connection, but when
  // working relations (investments in this case) there's always at least
  // on connection.
  starters = _.map(starters, o => {
    o.isStarter = true;
    return o;
  });

  var runner = function (degrees, partial, what) {
    let field = fieldMap[what];

    let conn = _(partial)
      .map(o => {
        let r = _(fullData)
          .filter(field, o[field])
          .sortBy('raised')
          .reverse()
          .take(5)
          .value();
        return o.isStarter === true ? r : r.concat(o);
      })
      .flatten()
      .uniq()
      .value();

    return degrees === 1 ? conn : runner(--degrees, conn, flipper[what]);
  };

  return runner(degrees, starters, what);
}
