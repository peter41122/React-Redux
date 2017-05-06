'use strict';
import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Link } from 'react-router';
import { setTrendsFilter } from '../actions/action-creators';
import ChartTrendsRounds from '../components/charts/chart-trends-rounds';
import NlForm from '../components/nl-form';
import NlFormController from '../utils/nl-form-controller';
import dataSettings from '../utils/data-settings';
import Constants from '../utils/constants';
import ScrollReminder from '../components/scroll-reminder';

var nlFormController = new NlFormController('More trends are revealed when broken down by {%filter%}')
  .addField({
    id: 'filter',             // Field name as defined in the token.
    active: 'sector',         // Key of the active option.

    opts: [                   // Available options.
      {
        key: 'sector',        // Option key will be returned when selected.
        value: 'sector'
      },
      {
        key: 'geography',
        value: 'geography'
      }
    ]
  });

var TrendsRounds = React.createClass({
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
    console.log('nl onNlSelect', selection);
    this.props.dispatch(setTrendsFilter(selection.filter));
  },

  popoverContentFn: function (d) {
    var data = _(d.data)
      .sortBy('value')
      .reverse()
      .map((d, i) => {
        return (
          <li key={i}>
            <span className='code' style={{backgroundColor: d.style.backgroundColor}}>&nbsp;</span>
            <span className='value'>{d.value}</span>
            <span className='label'>{d.label}</span>
          </li>
        );
      })
      .value();

    var str_label = d.label.toLowerCase();
    var glossary = Constants.roundGlossary['default'];

    if (Constants.roundGlossary[str_label] != undefined){
      glossary = Constants.roundGlossary[str_label];
    }

    return (
      <div className='chart-popover'>
        <h2 className='popover-title'>{glossary}</h2>
      </div>
    );

    /* return (
      <div className='chart-popover'>
        <h2 className='popover-title'>Number of {d.label} investments</h2>
        <ul className='data-legend'>
          {data}
        </ul>
      </div>
    ); */
  },

  prepareData: function () {
    let {activeFilter} = this.props.trendsSettings;
    /*
    [
      {
        label: 'Stage label',
        data: [
          {
            label: 'all',
            value: 10
          }
        ]
      }
    ]
     */
    this.trendsData1 = _(this.props.investments)
      .groupBy('funding_round_type')
      .map((d, k) => {
        let obj = {
          label: dataSettings.rounds.get(k).label,
          data: []
        };

        let filtered;
        let settings;
        switch (activeFilter) {
          case 'sector':
            // Group using the filter key.
            filtered = _(d).groupBy(o => _.get(o, 'sector', 'N/A'));
            settings = dataSettings.sectors;
            break;
          case 'geography':
            // Group using the filter key.
            filtered = _(d).groupBy(o => _.get(o, 'continent', 'N/A'));
            settings = dataSettings.geographies;
            break;
          default:
            filtered = null;
            settings = dataSettings.defaults;
        }

        if (filtered === null) {
          obj.data.push({
            label: 'All',
            value: d.length,
            style: settings.getStyle('all')
          });
        } else {
          obj.data = filtered
            .map((d, k) => {
              return {
                label: settings.get(k).label,
                value: d.length,
                style: settings.getStyle(k)
              };
            })
            .filter(o => o.label !== 'N/A')
            .sortBy('label')
            .value();
        }
        return obj;
      })
      .filter(o => o.label !== 'N/A')
      .sortBy('label')
      .value();

    console.log("Funding Round Types");
    console.dir(this.trendsData1);

      // THIS IS WHERE
    this.trendsData = _(this.props.investments)
      .groupBy('funding_round_code')
      .map((d, k) => {
        let obj = {
          label: dataSettings.rounds.get(k).label,
          data: []
        };

        let filtered;
        let settings;
        switch (activeFilter) {
          case 'sector':
            // Group using the filter key.
            filtered = _(d).groupBy(o => _.get(o, 'sector', 'N/A'));
            settings = dataSettings.sectors;
            break;
          case 'geography':
            // Group using the filter key.
            filtered = _(d).groupBy(o => _.get(o, 'continent', 'N/A'));
            settings = dataSettings.geographies;
            break;
          default:
            filtered = null;
            settings = dataSettings.defaults;
        }

        if (filtered === null) {
          obj.data.push({
            label: 'All',
            value: d.length,
            style: settings.getStyle('all')
          });
        } else {
          obj.data = filtered
            .map((d, k) => {
              return {
                label: settings.get(k).label,
                value: d.length,
                style: settings.getStyle(k)
              };
            })
            .filter(o => o.label !== 'N/A')
            .sortBy('label')
            .value();
        }
        return obj;
      })
      .filter(o => o.label !== 'N/A')
      .sortBy('label')
      .value();

  },

  renderSection: function () {
    let {activeSection, activeFilter} = this.props.trendsSettings;

    if (activeSection === 'general') {
      let sorted = _.sortBy(this.trendsData, 'data[0].value');
      return sorted.length ? (
        <div>
            <p className='stats-detail'>Investments can be made in a variety of ways. The majority of the investments recorded by Impact Alpha and Crunch base are seed and venture investments. These are shown at right organized chronologically: angel investments are the earliest money, while series G investments are the latest.</p>
            <p className='stats-detail'>The remaining investments are displayed below, organized by investment vehicle.</p>

            <p className='stats-detail'>The most common investments are made as <strong className='highlight' style={dataSettings.defaults.getStyle('all')}>Series A</strong> investments.</p>

            <p className='stats-detail'>The least common investments occur at the <strong className='highlight' style={dataSettings.defaults.getStyle('all')}>Angel</strong> stage.</p>
            <p className='stats-detail-disclaimer'>Disclaimer Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque interdum rutrum sodales. Nullam mattis fermentum libero. Lorem ipsum dolor sit amet. Pellentesque interdum rutrum sodales. Nullam mattis fermentum libero, non volutpa.</p>

        </div>
      ) : null;
    } else if (activeSection === 'breakdown') {
      let sorted = _.sortBy(this.trendsData, o => _.sum(o.data, 'value'));
      let topStage = _.last(sorted);
      let bottomStage = _.first(sorted);

      let topDimention = _.last(_.sortBy(topStage.data, 'value'));
      let bottomDimention = _.first(_.sortBy(bottomStage.data, 'value'));

      nlFormController.setActive('filter', activeFilter);
      return (
        <div>
          <p className='page-description-form'><NlForm sentence={nlFormController.getSentence()} fields={nlFormController.getFields()} onNlSelect={this.onNlSelect} /></p>
          <p className='stats-detail'>Most <strong>{topStage.label}</strong> investments are made in companies in <strong className='highlight' style={topDimention.style}>{topDimention.label}.</strong></p>
          <p className='stats-detail'>The fewest <strong>{bottomStage.label}</strong> investments are made in the <strong className='highlight' style={bottomDimention.style}>{bottomDimention.label}.</strong></p>
        </div>
      );
    }
  },

  render: function () {
    let {activeFilter, activeSection} = this.props.trendsSettings;
    let num = activeSection === 'general' ? 1 : 2;
    this.prepareData();

    return (
      <div className='trends-rounds trend-view' id='trends-4-types'>

        <div className='flex-wrapper-center'>
          <div className='content-data'>
            <div className='inner'>
              <h1 className='page-sec-title'><p>Investments <small className='badge'>{num}/2</small></p></h1>
              {this.renderSection()}
            </div>
          </div>
          <div className='content-infographic'>
            <div className='inner'>
              <ChartTrendsRounds investments={this.trendsData} filter={activeFilter} type='codes' popoverContentFn={this.popoverContentFn}/>
              <ChartTrendsRounds investments={this.trendsData1} filter={activeFilter} type='types'/>
            </div>
          </div>
        </div>
        <Link className='bttn bttn-base-dark cta-explore' to='/explore'>Explore the Ecosystem</Link>
        {activeSection === 'general' ? <ScrollReminder /> : null}
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

module.exports = connect(selector)(TrendsRounds);


/* <p className='stats-detail'>Most investments are <strong className='highlight' style={dataSettings.defaults.getStyle('all')}>{_.last(sorted).label}</strong> investments.</p>
 <p className='stats-detail'>The fewest investments are <strong className='highlight' style={dataSettings.defaults.getStyle('all')}>{_.first(sorted).label}</strong> stage.</p> */
