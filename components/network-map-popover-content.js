'use strict';
import React from 'react';

var NetworkMapPopoverContent = React.createClass({
  propTypes: {
    type: React.PropTypes.string,
    name: React.PropTypes.string,
    lastInvestment: React.PropTypes.string,
    total: React.PropTypes.string,
    totalNote: React.PropTypes.string,
    footNote: React.PropTypes.string
  },

  render: function () {
    let {type, name, lastInvestment, total, totalNote, footNote} = this.props;
    return (
      <div>
        {type ? <p className='sup-title'>{type}</p> : null}
        {name ? <p className='main-title'>{name}</p> : null}
        {lastInvestment ? <p className='description'>{lastInvestment}</p> : null}
        {total ? <p className='total-invest'>{total}</p> : null}
        {totalNote ? <p className='description'>{totalNote}</p> : null}
        {footNote ? <p className='note'>{footNote}</p> : null}
      </div>
    );
  }
});

module.exports = NetworkMapPopoverContent;
