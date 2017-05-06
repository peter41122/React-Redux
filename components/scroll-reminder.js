'use strict';
import React from 'react';

var NetworkMapLegend = React.createClass({
  propTypes: {
    onClickHandler: React.PropTypes.func
  },

  _onClick: function (e) {
    e.preventDefault();
    this.props.onClickHandler();
  },

  render: function () {
    return (
      <div className='scroll-reminder-wrapper'>
        <a href='#' onClick={this._onClick} className='scroll-reminder'><span>Next section</span></a>
      </div>
    );
  }
});

module.exports = NetworkMapLegend;
