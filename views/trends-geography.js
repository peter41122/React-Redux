'use strict';
import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { setTrendsFilter } from '../actions/action-creators';
import ChartTrendsGeo from '../components/charts/chart-trends-geo';
import { pushPath } from 'redux-simple-router';
import NlForm from '../components/nl-form';
import NlFormController from '../utils/nl-form-controller';
import dataSettings from '../utils/data-settings';
import ScrollReminder from '../components/scroll-reminder';

import WorldMap from '../components/world-map';

var nlFormController = new NlFormController('Most {%filter%} are made in companies impacting ')
  .addField({
    id: 'filter',                             // Field name as defined in the token.
    active: 'total-dollar',                   // Key of the active option.

    opts: [                                   // Available options.
      {
        key: 'total-dollar',                  // Option key will be returned when selected.
        value: 'investments by total dollar'
      },
      {
        key: 'total-investments',
        value: 'number of investments'
      }
    ]
  });

var TrendsGeo = React.createClass({
  propTypes: {
    children: React.PropTypes.object,
    dispatch: React.PropTypes.func,
    investments: React.PropTypes.array,
    trendsSettings: React.PropTypes.object
  },

  //  defaults to total dollar
  //  supports total number of investments
  getActiveFilter: function () {
    let activeFilter = this.props.trendsSettings.activeFilter;
    // Workaround the way the trends navigation sets the filter values;
    if (['total-dollar', 'total-investments'].indexOf(activeFilter) === -1) {
      return 'total-dollar';
    }
    return activeFilter;
  },

  geoNodeClickHandler : function (d, only_continent){
    if (only_continent)
      this.props.dispatch(pushPath(`/explore?geography=${d.continent}`));
    else{
      //console.log(d);
      this.props.dispatch(pushPath(`/explore?geography=${d.continent}&sector=${d.subsector}`));
    }
  },
  /**
   * Listener: Change on nlForm options.
   */
  onNlSelect: function (selection) {
    this.props.dispatch(setTrendsFilter(selection.filter));
  },

  // TEXT ASIDE FOR GEOGRAPHY
  // TODO: This should really be its own React component
  renderSection: function () {
    let investments = this.props.investments;
    // Just show continents or continents broken down by sector?
    let {activeSection} = this.props.trendsSettings;
    // Filter (dollar amount or total number of investments
    //let activeFilter = this.getActiveFilter();

    const activeFilter = 'total-investments'
    if (!investments.length) {
      return null;
    }

    let inv = _(investments)
      .groupBy('continent')
      .tap(d => { delete d['null']; delete d['']; })
      .map(o => _.reduce(o, (result, obj) => {
        if (result === null) {
          return {
            continent: obj.continent,
            raised: parseFloat(obj.raised, 10) || 0,
            num: 0
          };
        }
        result.raised += (parseFloat(obj.raised, 10) || 0);
        result.num++;
        return result;
      }, null))
      .filter(d => d.raised !== 0);

    let nlsentence;

    if (activeFilter === 'total-dollar' ) {
      nlFormController.setActive('filter', 'total-dollar');
      let topContinentAmount = inv.sortBy('raised').last();
      nlsentence = <p className='page-description-form'><NlForm sentence={nlFormController.getSentence()} fields={nlFormController.getFields()} onNlSelect={this.onNlSelect} /><strong className='highlight' style={{backgroundColor: dataSettings.geographies.get(topContinentAmount.continent).color}}>{topContinentAmount.continent}</strong>.dlsahfapoishfjopiashfoiashfopiasdhfopiahdsfo</p>;
      //
    } else if (activeFilter === 'total-investments') {
      nlFormController.setActive('filter', 'total-investments');
      let topContinentNum = inv.sortBy('num').last();
      nlsentence = <p className='page-description-form'>
          <span className="everyone-else font-inherit">
          Comparing impact objectives across continents (and excluding the United States), <strong>Community Development</strong> in the <strong>Americas</strong> receives the most investment. <strong>Conflict Resolution</strong> receives the least <strong>globally</strong>.
            <br/>
          </span>
      </p>

    }

    if (activeSection === 'general') {
      return nlsentence;
    } else if (activeSection === 'breakdown') {
    
      let inv = _(investments)
        .filter(o => !_.isEmpty(o.subsector) && !_.isEmpty(o.continent))
        .groupBy(o => `${o.subsector}-${o.continent}`)
        .values()
        .map(o => _.reduce(o, (result, obj) => {
          if (result === null) {
            return {
              continent: obj.continent,
              subsector: obj.subsector,
              raised: parseFloat(obj.raised, 10) || 0,
              num: 1
            };
          }
          result.raised += (parseFloat(obj.raised, 10) || 0);
          result.num++;
          return result;
        }, null))
        .filter(d => d.raised !== 0)
        .sortBy(activeFilter === 'total-dollar' ? 'raised' : 'num');
  
      let top = inv.last();
      let bottom = inv.first();

      return (
        <div>
          {nlsentence}

          <p className='stats-detail'>Comparing sectors across continents, <strong>{top.subsector}</strong> in <strong className='highlight' style={dataSettings.geographies.getStyle(top.continent)}>{top.continent}</strong> receives the most investment while <strong>{bottom.subsector}</strong> in <strong className='highlight' style={dataSettings.geographies.getStyle(bottom.continent)}>{bottom.continent}</strong> receives the least.</p>



        </div>
      );
    }
  },

  render: function () {
    let investments = this.props.investments;

    let {activeSection} = this.props.trendsSettings;
    let breakdownSection = {activeSection: 'breakdown'};
    //const activeSection = {activeSection: 'breakdown'};
    let activeFilter = this.getActiveFilter();
    let num = activeSection === 'general' ? 1 : 2;

    return (
      <div className='trends-geo trend-view' id='trends-2-geo'>

        <div className='flex-wrapper-center'>
          <div className='content-data'>
            <div className='inner'>
              <h1 className='page-sec-title'><p>Geography <small className='badge'>{num}/2</small></p></h1>
<p className='page-description-form'>
              Investors can choose to support a range of impact objectives in all corners of the world. At right, the number of investments in Impact Alpha’s and Crunch Base’s data systems are shown grouped by both goals and geography.
              </p>

              {this.renderSection()}

          <p className='page-description-form-disclaimer'>Disclaimer Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque interdum rutrum sodales. Nullam mattis fermentum libero. Lorem ipsum dolor sit amet. Pellentesque interdum rutrum sodales. Nullam mattis fermentum libero, non volutpa.</p>

             <WorldMap />
            </div>
          </div>
          <div className='content-infographic'>
            <div className='inner'>
                <ChartTrendsGeo investments={investments} section={activeSection} filter={activeFilter} nodeClickHandler={this.geoNodeClickHandler}/>
                <ChartTrendsGeo investments={investments} section={breakdownSection} filter={activeFilter} nodeClickHandler={this.geoNodeClickHandler}/>
            </div>
          </div>
        </div>

        <ScrollReminder />
      </div>
    );
  }
});
              // <div className='innerPosFix'>
              //   <ChartTrendsGeo investments={investments} section={breakdownSection} filter={activeFilter} />
              // </div>
// /////////////////////////////////////////////////////////////////// //
// Connect functions

function selector (state) {
  return {
    investments: state.investments.items,
    trendsSettings: state.trends
  };
}

module.exports = connect(selector)(TrendsGeo);


//<NlForm sentence={nlFormController.getSentence()} fields={nlFormController.getFields()} onNlSelect={this.onNlSelect} /><strong className='highlight' style={{backgroundColor: dataSettings.geographies.get(topContinentNum.continent).color}}>{topContinentNum.continent}</strong> HADSPIFAHAODFIHR.
