'use strict';
import React from 'react';
import Dropdown from '../components/dropdown';

var NetworkMapLegend = React.createClass({
  propTypes: {
    listed: React.PropTypes.string.isRequired
  },

  render: function () {
    let listed = this.props.listed;
    return (
      <Dropdown className={`network-key drop dropdown right ${listed}`} triggerTitle='View Legend' triggerClassName='bttn-legend' triggerText='Legend'>
        <ul className='key-content'>
          {/* <li className='fund'>Fund</li> */}
          <li className='investor'>Investor</li>
          <li className='company'>Company</li>
          <li className={`listed-${listed}`}>Listed {listed === 'investor' ? 'Investor' : 'Company'}</li>
        </ul>
      </Dropdown>
    );
  }
});

module.exports = NetworkMapLegend;
