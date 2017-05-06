// This was converted from counting faulty dollar amounts to
// counting number of investments.  "raised" was thus converted
// from dollar amounts to sheer number... but was lazily left being
// called "raised" because it made the code work.

'use strict';
import React from 'react';
import d3 from 'd3';
import _ from 'lodash';

import dataSettings from '../../utils/data-settings';
import { formatCurrency } from '../../utils/numbers';


var ChartTrendsSector = React.createClass({
  chart: null,

  onWindowResize: function () {
    this.chart.update();
  },

  componentDidMount: function () {
    // console.log('ChartTrendsSector componentDidMount');
    // Debounce event.
    this.onWindowResize = _.debounce(this.onWindowResize, 200);
    window.addEventListener('resize', this.onWindowResize);

    //actually render the chart
    this.chart = new Chart(this.refs.container, this.props);
  },

  componentWillUnmount: function () {
    // console.log('ChartTrendsSector componentWillUnmount');
    window.removeEventListener('resize', this.onWindowResize);
    this.chart.destroy();
  },

  componentDidUpdate: function (/* prevProps, prevState */) {
    // console.log('ChartTrendsSector componentDidUpdate');
    this.chart.setData(this.props);
  },

  render: function () {
    return (
      <div className='chart-trends-sector' ref='container'></div>
    );
  }
});

module.exports = ChartTrendsSector;

var Chart = function (el, data) {
  this.$el = d3.select(el);

  this.data = null;
  this.stages = null;

  var _this = this;
  // Var declaration.
  var margin = {top: 0, right: 32, bottom: 48, left: 50};
  // width and height refer to the data canvas. To know the svg size the margins
  // must be added.
  var _width;
  var maxBubbleLayoutSize = 450;
  // Scales, Axis.
  var xBreakdown, rBreakdown;
  // Layouts:
  var bubble;
  // Elements.
  var svg, dataCanvas, bubbleCanvas, breakdownCanvas;


  var __prevSection__ = null;
  var __currSection__ = null;
  var __prevFilter__ = null;
  var __currFilter__ = null;

  this._calcSize = function () {
    _width = parseInt(this.$el.style('width'), 10) - margin.left - margin.right;
    // _height = parseInt(this.$el.style('height'), 10) - margin.top - margin.bottom;
  };

  this.setData = function (data) {
    var _data = _.cloneDeep(data);
    this.popoverContentFn = _data.popoverContentFn;
    this.nodeClickHandler = _data.nodeClickHandler;
    __currFilter__ = data.filter;
    this.processData(_data);
    this.update();
  };

  this.processData = function (data) {
    let investments = data.investments;
    if (investments === null || !investments.length) {
      return;
    }
    //var count = 1;

    var investmentReducer = function (result, obj, key) {
      //obj.raised = +(obj.raised);
      if (result === null) {
        //console.log(count++, "---", obj.subsector);
        return {
          sector: obj.subsector,
          raised: 1,
          continent: obj.continents
        };
      }

      result.raised += 1;
      //result.raised += parseFloat(obj.raised, 10);
      // result.funded_at = result.funded_at < obj.funded_at ? obj.funded_at : result.funded_at;

      return result;
    };

    // Group by sector for the bubble chart.
    var dataPrepare = _(investments)
      .groupBy('subsector')
      .tap(d => { delete d['null']; })
      .values();

    var bubbleData = dataPrepare
      .map(o => _.reduce(o, investmentReducer, null))
      .value();

    var breakdownData = dataPrepare
      .map(o => {
        return _(o)
          .groupBy('continent')
          .tap(d => { delete d['null']; })
          .values()
          .map(o => _.reduce(o, investmentReducer, null))
          .sortBy('raised')
          .reverse()
          .value();
      })
      .sortBy(d => _.sum(d, 'raised'));

    if (__currFilter__ === 'top-sector' || __currFilter__ === 'all') {
      breakdownData = breakdownData.reverse();
    }

    breakdownData = breakdownData
      // .reverse()
      .take(3)
      .value();

    this.data = {
      bubble: bubbleData,
      breakdownData: breakdownData,
      section: data.section
    };
  };

  // STEP 1: Make the d3 bubble canvas
  this._init = function () {
    this._calcSize();
    // The svg.
    svg = this.$el.append('svg')
        .attr('class', 'chart');

    // X scale. Range updated in function.
    xBreakdown = d3.scale.ordinal();

    // R scale. Range updated in function.
    rBreakdown = d3.scale.linear();

    bubble = d3.layout.pack()
      .sort(null)
      .value(d => d.raised)
      .size([Math.min(_width, maxBubbleLayoutSize), Math.min(_width, maxBubbleLayoutSize)])
      .padding(20);

    // Chart elements
    dataCanvas = svg.append('g')
      .attr('class', 'data-canvas')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    bubbleCanvas = dataCanvas.append('g')
      .attr('class', 'bubble-canvas');

    breakdownCanvas = dataCanvas.append('g')
      .attr('class', 'breakdown-canvas');
  };

  // make the actual chart
  this.update = function () {
    if (this.data === null) {
      return;
    }
    this._calcSize();

    __currSection__ = this.data.section;

    var yHeight = this.data.breakdownData.length * 150;

    // Each spot should use 80px but there must always be space for all
    // the sectors.
    let numSectors = d3.max(this.data.breakdownData, d => d.length);
    let maxSpots = Math.floor(_width / 80);
    let spots = Math.max(numSectors, maxSpots);

    xBreakdown
      .domain(d3.range(0, spots))
      .rangePoints([0, _width]);

    svg
      .attr('width', _width + margin.left + margin.right)
      .attr('height', yHeight + margin.top + margin.bottom);

    dataCanvas
      .attr('width', _width)
      .attr('height', yHeight);

    // ///////////////////////////////////
    // Bubble chart elements.
    var datus = bubble.nodes({children: this.data.bubble})
      .filter(d => !d.children);

    // 20 bubbles is too many

    // slice off the first element - it's NaN
    datus = _.sortBy(datus, 'raised').reverse().slice(1);

    for (var i = 0; i < datus.length; i++){
      if (i < 5 ) {
        datus[i].top5 = true;
      } else {
        datus[i].top5 = false;
      }
    };

    // Reverse the element rendering order - top5 last
    datus.reverse();

    console.log("DATUS");
    console.dir(datus);

    var gen_nodes = bubbleCanvas.selectAll('.node')
      .data(datus);

    var gen_nodesGroup = gen_nodes.enter()
      .append('g')
      .attr('class', 'node')
      .attr('class', d => d.top5 ? "node top5" : "node not-top5");

   gen_nodes
      .style('cursor', 'pointer')
      .on('click', function(d){
        console.log("Node clicked");
        if (!_this.nodeClickHandler){
          return;
        }
        _this.nodeClickHandler(d);
      });

    gen_nodesGroup.append('circle')
      .style('fill', d => dataSettings.sectors.get(d.sector).color)
      .style('opacity', 1);

    gen_nodesGroup.append('text')
      .attr('class', 'bubble-label')
      .style('text-anchor', 'middle');

    gen_nodesGroup.append('text')
      .attr('class', 'bubble-value')
      .style('text-anchor', 'middle');

    //size
    gen_nodes.selectAll('circle')
      .attr('r', d => d.r)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('data-sector', d => d.sector)
      .attr('data-top5', d => d.top5)
      .attr('data-number', d => d.raised)
      .attr('class', d => 'objective-node');

    gen_nodes.selectAll('text.bubble-label')
      .attr('x', d => d.x)
      .attr('y', d => d.y - d.r / 2)
      .text(d => d.sector);
    //
    gen_nodes.selectAll('text.bubble-value')
      .text(d => d.raised)
      .attr('x', d => d.x)
      .attr('y', d => d.y - d.r / 2)
      .attr('dy', '1.25em');
    //  .text(d => `$${formatCurrency(d.raised)}`);

    // ///////////////////////////////////
    // Breakdown chart elements.
    var breakdownExtents = [];
    _.forEach(this.data.breakdownData, d => {
      var ext = d3.extent(d, dd => dd.raised);
      breakdownExtents = breakdownExtents.concat(ext);
    });

    rBreakdown
      .domain(d3.extent(breakdownExtents))
      .range([5, 20]);

    var bre_rows = breakdownCanvas.selectAll('g.row')
      .data(this.data.breakdownData);

    var bre_enterRow = bre_rows.enter()
      .append('g')
        .attr('transform', (d, i) => `translate(0,${i * 150 + 50})`);

    bre_enterRow.append('text')
      .attr('class', 'row-label')
      .style('text-anchor', 'start');

    bre_rows
      .attr('class', d => `row ${ _.kebabCase(d[0].sector)}`);

    bre_rows.selectAll('text.row-label')
      .data(d => d)
      .attr('x', -rBreakdown.range()[1])
      .attr('y', -rBreakdown.range()[1])
      .attr('dy', '-1em')
      .style('opacity', 1)
      .text(d => d.sector);

    var bre_thecircles = bre_rows.selectAll('circle.sector-datum')
      .data(d => d);

    bre_thecircles.enter()
      .append('circle')
      .attr('class', 'sector-datum')
      .style('fill', d => dataSettings.sectors.get(d.sector).color);

    bre_thecircles
      .style('opacity', 1)
      .attr('cx', (d, i) => xBreakdown(i))
      .transition()
      .duration(500)
      .style('fill', d => dataSettings.sectors.get(d.sector).color)
      .attr('r', d => rBreakdown(d.raised));

    bre_thecircles.exit()
      .transition()
      .duration(500)
      .style('opacity', 0)
      .remove();

    var bre_thelabels = bre_rows.selectAll('text.sector-datum-label')
      .data(d => d);

    bre_thelabels.enter()
      .append('text')
      .attr('class', 'sector-datum-label')
      .style('text-anchor', 'middle');

    bre_thelabels
      .attr('x', (d, i) => xBreakdown(i))
      .attr('y', rBreakdown.range()[1])
      .attr('dy', '1.5em')
      .style('opacity', 1)
      .text(d => d.continent);

    bre_thelabels.exit()
      .transition()
      .duration(500)
      .style('opacity', 0)
      .remove();

    var bre_thevalues = bre_rows.selectAll('text.sector-datum-value')
      .data(d => d);

    bre_thevalues.enter()
      .append('text')
      .attr('class', 'sector-datum-value')
      .style('text-anchor', 'middle');

    bre_thevalues
      .attr('x', (d, i) => xBreakdown(i))
      .attr('y', rBreakdown.range()[1])
      .attr('dy', '3em')
      .style('opacity', 1)
      .text(d => d.raised ? `$${formatCurrency(d.raised)}` : 'UNDISCLOSED');

    bre_thevalues.exit()
      .transition()
      .duration(500)
      .style('opacity', 0)
      .remove();

    // ///////////////////////////////////
    // Transition
    var getCorresponding = function (sector) {
      let s = _.kebabCase(sector);
      // console.log('sel', d3.select(`.row.${s} circle`));
      return d3.select(`.row.${s} circle`);
    };

    // The __prevSection__ === null can later be used for entering animations.
    if (__prevSection__ === __currSection__ || __prevSection__ === null) {
      console.log('Same section', __currSection__);
      // Position elements according with current section.
      if (__currSection__ === 'general') {
        bre_rows.selectAll('text.row-label')
          .style('opacity', 0);

        bre_thecircles
          .style('opacity', 0);

        bre_thelabels
          .style('opacity', 0);

        bre_thevalues
          .style('opacity', 0);

        //
      } else if (__currSection__ === 'breakdown') {
        gen_nodes.selectAll('text')
          .style('opacity', 0);

        gen_nodes.selectAll('circle')
          .style('opacity', 0);
      }


    } else if (__prevSection__ === 'general' && __currSection__ === 'breakdown') {
      console.log('general ==> breakdown');
      // Set initial state of the breakdown chart
      bre_rows.selectAll('text.row-label')
        .style('opacity', 0);

      bre_thecircles
        .attr('cx', 0)
        .style('opacity', 0);

      bre_thelabels
        .attr('dy', '0em')
        .style('opacity', 0);

      bre_thevalues
        .attr('dy', '1.5em')
        .style('opacity', 0);

      // vv Start hide bubble

      let bubbleNodes = gen_nodes.sort((a, b) => b.raised - a.raised);

      let top3Nodes = bubbleNodes.filter((d, i) => i < 3);
      let restNodes = bubbleNodes.filter((d, i) => i >= 3);

      bubbleNodes.selectAll('text')
        .transition()
        .duration(250)
        .style('opacity', 0);

      restNodes.select('circle')
        .transition()
        .duration(250)
        .style('opacity', 0);

      let i = -1;
      let t0 = top3Nodes.select('circle')
        .transition()
        .duration(500)
        .attr('cx', d => 0)
        .attr('cy', d => ++i * 150 + 50)
        .attr('r', d => getCorresponding(d.sector).attr('r'));

      t0.transition()
        .delay(500)
        .style('opacity', 0);

      // ^^ End hide bubble

      // vv Start show breakdown
      bre_rows.selectAll('text.row-label')
        .transition()
        .duration(500)
        .delay(500)
        .style('opacity', 1);

      let t1 = bre_thecircles
        .transition()
        .duration(500)
        .delay(500)
        .style('opacity', 1);

      t1.transition()
        .duration(500)
        .attr('cx', (d, i) => xBreakdown(i));

      bre_thelabels
        .transition()
        .duration(500)
        .delay(1000)
        .style('opacity', 1)
        .attr('dy', '1.5em');

      bre_thevalues
        .transition()
        .duration(500)
        .delay(1000)
        .style('opacity', 1)
        .attr('dy', '3em');


    } else if (__prevSection__ === 'breakdown' && __currSection__ === 'general') {
      console.log('breakdown ==> general');
      // Set initial state of the bubble chart
      let bubbleNodes = gen_nodes.sort((a, b) => b.raised - a.raised);

      let top3Nodes = bubbleNodes.filter((d, i) => i < 3);
      let restNodes = bubbleNodes.filter((d, i) => i >= 3);

      bubbleNodes.selectAll('text')
        .style('opacity', 0);

      restNodes.select('circle')
        .style('opacity', 0);

      let i = -1;
      top3Nodes.select('circle')
        .attr('cx', d => 0)
        .attr('cy', d => ++i * 150 + 50)
        .attr('r', d => getCorresponding(d.sector).attr('r'))
        .style('opacity', 1);

      // vv Start hide breakdown
      bre_thelabels
        .transition()
        .duration(500)
        .style('opacity', 0)
        .attr('dy', '0em');

      bre_thevalues
        .transition()
        .duration(500)
        .style('opacity', 0)
        .attr('dy', '1.5em');

      bre_thecircles.transition()
        .delay(500)
        .duration(500)
        .attr('cx', (d, i) => 0)
        .each('end', function (d) {
          d3.select(this).style('opacity', 0);
        });

      bre_rows.selectAll('text.row-label')
        .transition()
        .duration(500)
        .delay(500)
        .style('opacity', 0);
      // ^^ End hide breakdown

      // vv Start show bubble
      top3Nodes.select('circle')
        .transition()
        .delay(1000)
        .duration(500)
        .attr('r', d => d.r)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      restNodes.select('circle')
        .transition()
        .delay(1000)
        .duration(500)
        .style('opacity', 1);

      bubbleNodes.selectAll('text')
        .transition()
        .delay(1000)
        .duration(500)
        .style('opacity', 1);
      // ^^ End show bubble
    }

    __prevSection__ = __currSection__;
    __prevFilter__ = __currFilter__;
  };

  this.destroy = function () {};

  // ------------------------------------------------------------------------ //
  // 3... 2... 1... GO...
  this._init();
  this.setData(data);
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
