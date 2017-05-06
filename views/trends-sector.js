'use strict';
import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { setTrendsFilter } from '../actions/action-creators';
import ChartTrendsSector from '../components/charts/chart-trends-sector';
import { pushPath } from 'redux-simple-router';
import NlForm from '../components/nl-form';
import NlFormController from '../utils/nl-form-controller';
import dataSettings from '../utils/data-settings';
import ScrollReminder from '../components/scroll-reminder';

var nlFormController = new NlFormController('Geographic variations shown by {%filter%}')
  .addField({
    id: 'filter',             // Field name as defined in the token.
    active: 'top-sector',         // Key of the active option.

    opts: [                   // Available options.
      {
        key: 'top-sector',        // Option key will be returned when selected.
        value: 'top sectors'
      },
      {
        key: 'bottom-sector',
        value: 'bottom sectors'
      }
    ]
  });

var TrendsSector = React.createClass({
  propTypes: {
    children: React.PropTypes.object,
    dispatch: React.PropTypes.func,
    investments: React.PropTypes.array,
    trendsSettings: React.PropTypes.object
  },

  trendsData: null,

  /**
   * Listener: Change on nlForm options.
   */
  onNlSelect: function (selection) {
    this.props.dispatch(setTrendsFilter(selection.filter));
  },

  popoverContentFn: function (d) {
  },

  issueMapNodeClickHandler : function (d){
    console.log("Node click handler");
    this.props.dispatch(pushPath(`/explore?sector=${d.sector}`));
  },
  renderSection: function () {
    let {activeSection, activeFilter} = this.props.trendsSettings;
    let investments = this.props.investments;

    if (!investments.length) {
      return null;
    }



    // take that first() off at the end and you've got everything you need
    if (activeSection === 'general') {
      let topSector = _(investments)
        .groupBy('subsector')
        .tap(d => { delete d['null']; delete d['']; })
        .values()
        .map(o => _.reduce(o, (result, obj, key) => {
          obj.raised = +(obj.raised);
          if (result === null) {
            return {
              sector: obj.subsector,
              raised: obj.raised
            };
          }
          result.raised += parseFloat(obj.raised, 10);
          return result;
        }, null))
        .sortBy('raised')
        .reverse()
        .first();

        console.log("----------------------"); console.dir(topSector); console.log("----------------------");

      let topSectorSubsector = _(investments)
        .filter('sector', topSector.sector)
        .groupBy('subsector')
        .tap(d => { delete d['null']; delete d['']; delete d[' '] })
        .values()
        .map(o => _.reduce(o, (result, obj, key) => {
          obj.raised = +(obj.raised);
          if (result === null) {
            return {
              sector: obj.subsector,
              subsector: obj.subsector,
              raised: obj.raised
            };
          }
          result.raised += parseFloat(obj.raised, 10);
          return result;
        }, null))
        .sortBy('raised')
        .reverse()
        .value();

      return (
        <div className="metric">
          <p className='stats-detail'>
              Different investment issue areas receive varying levels of investment. At right, you can see which issue areas received greater or fewer total investments.<br/>

              The greatest number of investments is made in <strong>Health Improvement</strong>, followed by <strong>Capacity Building</strong> and <strong>Access to Information.</strong>

              The fewest investments are made in <strong>Conflict Resolution</strong>, followed by <strong>Affordable Housing</strong> and <strong>Human Rights Protection or Expansion.</strong>

          </p>
          <p className='stats-detail-disclaimer'>Disclaimer Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque interdum rutrum sodales. Nullam mattis fermentum libero. Lorem ipsum dolor sit amet. Pellentesque interdum rutrum sodales. Nullam mattis fermentum libero, non volutpa.</p>

        </div>
      );
    } else if (activeSection === 'breakdown') {
      nlFormController.setActive('filter', activeFilter);
      return (
        <div>
          <p className='page-description-form'><NlForm sentence={nlFormController.getSentence()} fields={nlFormController.getFields()} onNlSelect={this.onNlSelect} /></p>
        </div>
      );
    }
  },


  render: function () {
    let {activeSection, activeFilter} = this.props.trendsSettings;
    let investments = this.props.investments;
    let num = activeSection === 'general' ? 1 : 2;

    return (
      <div className='trends-sector trend-view' id='trends-3-rounds'>

        <div className='flex-wrapper-center'>
          <div className='content-data'>
            <div className='inner'>
              <h1 className='page-sec-title'><p>Investment Issue Areas <small className='badge'>{num}/2</small></p></h1>
              {this.renderSection()}
            </div>
          </div>
          <div className='content-infographic'>
            <div className='inner'>
              <ChartTrendsSector
                  investments={investments}
                  filter={activeFilter}
                  section={activeSection}
                  nodeClickHandler={this.issueMapNodeClickHandler}/>
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
    investments: state.investments.items,
    trendsSettings: state.trends
  };
}

module.exports = connect(selector)(TrendsSector);


//The most investments made are in <strong className='highlight' style={dataSettings.sectors.getStyle(topSector.sector)}>{topSector.sector}</strong>.
