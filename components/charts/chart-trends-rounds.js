'use strict';
import React from 'react';
import d3 from 'd3';
import _ from 'lodash';
import Popover from '../../utils/popover';

import { roundsToDisplay, roundTypesToDisplay } from '../../utils/data-settings';

var ChartTrendsRounds = React.createClass({
  chart: null,

  onWindowResize: function () {
    this.chart.update();
  },

  // Build the d3 chart here
  componentDidMount: function () {
    // console.log('ChartTrendsRounds componentDidMount');
    // Debounce event.
    this.onWindowResize = _.debounce(this.onWindowResize, 200);

    window.addEventListener('resize', this.onWindowResize);
    this.chart = new Chart(this.refs.container, this.props);
  },

  componentWillUnmount: function () {
    // console.log('ChartTrendsRounds componentWillUnmount');
    window.removeEventListener('resize', this.onWindowResize);
    this.chart.destroy();
  },

  componentDidUpdate: function (/* prevProps, prevState */) {
    // console.log('ChartTrendsRounds componentDidUpdate');
    this.chart.setData(this.props);
  },

  render: function () {
    return (
      <div className='chart-trends-rounds' ref='container'></div>
    );
  }
});

module.exports = ChartTrendsRounds;

// Rounds trends chart class called by ComponentDidMount
// calls _init() and setData
// Takes two arguments:
//     el -- Reference to element to
var Chart = function (el, data) {
  // ----------------------//
  // instance properties   //
  // ----------------------//

  //
  this.$el = d3.select(el);

  this.data = null;
  if (data.type == 'codes')
    this.stages = roundsToDisplay;
  else
    this.stages = roundTypesToDisplay;

  var _type = data.type;
  var _this = this;

  // -------------------//
  // class properties   //
  // -------------------//

  // required for chart building properties
  var margin = {top: 64, right: 32, bottom: 48, left: 150};
  // width and height refer to the data canvas. To know the svg size the margins
  // must be added.
  var _width;
  // Scales, Axis.
  var x, y, xAxis, yAxis;
  // Elements.
  var svg, dataCanvas;

  // init the popover
  var chartPopover = new Popover();

  // -------------------//
  // methods            //
  // -------------------//

  this._calcSize = function () {
    _width = parseInt(this.$el.style('width'), 10) - margin.left - margin.right;
    // _height = parseInt(this.$el.style('height'), 10) - margin.top - margin.bottom;
  };


  // STEP 1: Build the chart canvas.
  this._init = function () {
    this._calcSize();
    // Attach the chart to
    svg = this.$el.append('svg')
        .attr('class', 'chart');

    // X scale. Range updated in function.
    x = d3.scale.linear();
    // Y scale. Range updated in function.
    y = d3.scale.ordinal();
    // Define xAxis function.
    xAxis = d3.svg.axis()
      .scale(x)
      .orient('top')
      .tickSize(0);
    // Define yAxis function
    yAxis = d3.svg.axis()
      .scale(y)
      .orient('left');

    // Chart elements
    dataCanvas = svg.append('g')
      .attr('class', 'data-canvas')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    svg.append('g')
      .attr('class', 'x axis')
      .append('text')
      .attr('class', 'label')
      .attr('text-anchor', 'start');
    svg.append('g')
      .attr('class', 'y axis')
      .append('text')
      .attr('class', 'label')
      .attr('text-anchor', 'middle');
  };

  // STEP 2: Add data, then call step 3.
  this.setData = function (data) {
    var _data = _.cloneDeep(data);
    this.popoverContentFn = _data.popoverContentFn;
    this.processData(_data);
    this.update();
  };

  // data is this.props, which has investments attached
  // this.props is passed by
  this.processData = function (data) {
    let investments = data.investments;
    if (investments === null || !investments.length) {
      return;
    }
    this.data = investments;
    console.log("ROUNDS DATA YALL", this.data);

    // WHICH TYPES OF THINGS DO WE ACTUALLY WANT TO LOOK AT
    //this.stages = _.pluck(investments, 'label');
    // TODO: add this to constants instead of buried in the middle of the code
    var newData = [];
    var labelIndexMap = {};

    if (data.type == 'codes') {
      for (var i in investments){
        if (this.stages.indexOf(investments[i].label) === -1) {
          continue;
        } else if (labelIndexMap[investments[i].label] != null) {
          //Duplicate
          var duplicateIndex = labelIndexMap[investments[i].label];

          if (newData[duplicateIndex].data[0].value < investments[i].data[0].value)
            newData[duplicateIndex] = investments[i];

        } else {
          labelIndexMap[investments[i].label] = newData.length;
          newData.push(investments[i]);
        }
      }

      
    }else{
      for (var i in investments){
        if (this.stages.indexOf(investments[i].label) === -1) {
          continue;
        }else{
          newData.push(investments[i]);
        }
      }


    }
    this.data = newData;
    //this.stages = ['']
  };

  // STEP 3: Do the d3 dirty work
  // uses this.data and this.stages
  this.update = function () {
    if (this.data === null) {
      return;
    }
    this._calcSize();

    console.log("Rounds", this.data);
    // Stack the data.
    _.forEach(this.data, (d, i) => {
      var c = 0;
      _.forEach(d.data, (dd, ii) => {
        this.data[i].data[ii].x0 = c;
        c += dd.value;
      });
    });

    x.domain([0, d3.max(this.data, d => _.sum(d.data, 'value'))])
      .range([0, _width]);

    // In the case of this chart the height will depend on the content.
    // We're not scaling the content based on the height.
    let yHeight = this.stages.length * 35;

    y.domain(this.stages)
      .rangeBands([0, yHeight], 1 / 3);

    svg
      .attr('width', _width + margin.left + margin.right)
      .attr('height', yHeight + margin.top + margin.bottom);

    dataCanvas
      .attr('width', _width)
      .attr('height', yHeight);

    // Append Axis.
    svg.select('.x.axis')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .transition()
      .call(xAxis);

    if (_type == "codes"){
      svg.select('.x.axis .label')
        .text('Number of Equity Investments by Round')
        .attr('x', 0)
        .attr('y', -48);
    }else{
      svg.select('.x.axis .label')
      .text('Number of All Investments by Round')
      .attr('x', 0)
      .attr('y', -48);
    }

    svg.select('.y.axis')
      .attr('transform', `translate(${margin.left - 10},${margin.top})`)
      .transition()
      .call(yAxis);
      // .selectAll('.tick text')
      //   .call(wrap, 100);
    console.dir(this.data);
    var barGroups = dataCanvas.selectAll('g.bar-group')
      .data(this.data);

    barGroups.enter()
      .append('g')
      .attr('class', 'bar-group')
      .attr('transform', d => {
        return `translate(0,${y(d.label)})`;
      });

    var bars = barGroups.selectAll('rect.bar')
      .data(d => d.data);
    var labels= barGroups.selectAll('text.label')
      .data(d => d.data);

    var bars_group = bars.enter()
      .append('rect')
      .attr('class', 'bar')
      .style('fill', d => d.style.backgroundColor)
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 0)
      .attr('height', y.rangeBand());

    var labels_group = labels.enter()
        .append('text')
        .attr('class', 'label');
    labels
      .text(d => d.value)
      .attr('x' , d => x(d.x0) + x(d.value) + 5)
      .attr('y' , 15);

    bars
      .transition()
      .duration(500)
      .style('fill', d => d.style.backgroundColor)
      .attr('x', d => x(d.x0))
      .attr('width', d => x(d.value));

    bars.exit()
      .transition()
      .duration(500)
      .attr('x', 0)
      .attr('width', 0);

    var ghostBar = dataCanvas.selectAll('bar-ghost')
      .data(this.data);

    ghostBar.enter()
      .append('rect')
      .attr('class', 'bar-ghost')
      .style('opacity', 0)
      .attr('x', 0)
      .attr('y', d => y(d.label))
      .attr('width', _width)
      .attr('height', y.rangeBand())
      .on('mouseover', function (d) {
        var matrix = this.getScreenCTM()
          .translate(this.getAttribute('x'), this.getAttribute('y'));

        // This is the width of the real bar, not the ghost one.
        var barWidth = x(_.sum(d.data, 'value'));

        var posX = window.pageXOffset + matrix.e + barWidth / 2;
        var posY = window.pageYOffset + matrix.f - 8;

        chartPopover.setContent(_this.popoverContentFn(d)).show(posX, posY);
      })
      .on('mouseout', function (d) {
        chartPopover.hide();
      });
  };

  this.destroy = function () {
    chartPopover.hide();
  };

  // ------------------------------------------------------------------------ //
  // STEP 0: Fire ze missiles.
  this._init(); // build the chart canvas
  this.setData(data);  // Add the bars.
};

// function wrap (text, width) {
//   text.each(function () {
//     var text = d3.select(this);
//     // var words = text.text().split(/\s+/).reverse();
//     var words = text.text().split(/_/).reverse();
//     var word;
//     var line = [];
//     var lineNumber = 0;
//     var lineHeight = 1.1; // ems
//     var y = text.attr('y');
//     var dy = parseFloat(text.attr('dy'));
//     var tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');
//     while (word = words.pop()) {
//       line.push(word);
//       tspan.text(line.join(' '));
//       if (tspan.node().getComputedTextLength() > width) {
//         line.pop();
//         tspan.text(line.join(' '));
//         line = [word];
//         tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
//       }
//     }
//   });
// }
