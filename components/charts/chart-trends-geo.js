'use strict';
import React from 'react';
import d3 from 'd3';
import _ from 'lodash';
import dataSettings from '../../utils/data-settings';
import { formatCurrency } from '../../utils/numbers';


var ChartTrendsGeo = React.createClass({
  chart: null,

  onWindowResize: function () {
    this.chart.update();
  },

  componentDidMount: function () {
    // console.log('ChartTrendsSector componentDidMount');
    // Debounce event.
    this.onWindowResize = _.debounce(this.onWindowResize, 200);

    window.addEventListener('resize', this.onWindowResize);
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
      <div className='chart-trends-geo' ref='container'></div>
    );
  }
});

module.exports = ChartTrendsGeo;

var Chart = function (el, data) {
  this.$el = d3.select(el);

  this.data = null;
  this.stages = null;
  var _this = this;

  // Var declaration.
  var margin = {top: 0, right: 32, bottom: 80, left: 200};
  // width and height refer to the data canvas. To know the svg size the margins
  // must be added.
  var _width;
  // Scales, Axis.
  var xGeneral, yGeneral, rGeneral, xBreakdown, yBreakdown, rBreakdown;
  // Elements.
  var svg, dataCanvas, generalCanvas, breakdownCanvas;

  var __prevSection__ = null;
  var __currSection__ = null;

  this._calcSize = function () {
    _width = parseInt(this.$el.style('width'), 10) - margin.left - margin.right;
    // _height = parseInt(this.$el.style('height'), 10) - margin.top - margin.bottom;
  };

  this.setData = function (data) {
    var _data = _.cloneDeep(data);
    this.popoverContentFn = _data.popoverContentFn;
    this.nodeClickHandler = _data.nodeClickHandler;
    this.currSection = data.section;
    //this.dataKey = data.filter === 'total-dollar' ? 'raised' : 'num';
    this.dataKey = 'num';
    this.processData(_data);
    this.update();
  };

  this.processData = function (data) {
    let investments = data.investments;
    if (investments === null || !investments.length) {
      return;
    }

    // Group by sector for the bubble chart.
    console.time('Group investments');
    var dataPrepare = _(investments)
      .groupBy('continent')
      // remove Oceania
      .tap(d => { delete d['null']; delete d['']; delete d['Oceania'];})
        .tap(d => { console.log(d)})
      .values();

    var generalData = dataPrepare
      .map(o => _.reduce(o, (result, obj) => {
        if (result === null) {
          return {
            continent: obj.continent,
            raised: parseFloat(obj.raised, 10) || 0,
            num: 1
          };
        }
        result.raised += (parseFloat(obj.raised, 10) || 0);
        result.num++;
        return result;
      }, null))
      .sortBy(this.dataKey)
      .reverse()
      .value();

    var breakdownData = dataPrepare
      .map(o => {
        return _(o)
          .groupBy('subsector')
          .tap(d => { delete d['null']; delete d['']; })
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
          .value();
      })
      .sortBy(d => _.sum(d, dd => dd[this.dataKey]))
      .reverse()
      .value();
    console.timeEnd('Group investments');

    let breakdownContinents = _.pluck(breakdownData, '0.continent');
    console.time('Sort sectors');
    let breakdownSubsectors = _(breakdownData)
      .map(o => _.pluck(o, 'subsector'))
      .flatten()
      .uniq()
      .sortBy(o => _.max(_.map(breakdownData, oo => {
        let subsector = _.find(oo, 'subsector', o);
        return _.get(subsector, this.dataKey, 0);
      })))
      .reverse()
      .value();
    console.timeEnd('Sort sectors');

    this.data = {
      generalData: generalData,
      breakdownData: breakdownData,
      breakdownContinents: breakdownContinents,
      breakdownSubsectors: breakdownSubsectors,
      section: data.section
    };
  };

  this._init = function () {
    this._calcSize();
    // The svg.
    svg = this.$el.append('svg')
        .attr('class', 'chart');

    // X scale. Range updated in function.
    xGeneral = d3.scale.ordinal();

    // Y scale. Range updated in function.
    yGeneral = d3.scale.ordinal();

    // R scale. Range updated in function.
    rGeneral = d3.scale.linear();

    // X scale. Range updated in function.
    xBreakdown = d3.scale.ordinal();

    // Y scale. Range updated in function.
    yBreakdown = d3.scale.ordinal();

    // R scale. Range updated in function.
    rBreakdown = d3.scale.linear();

    // Chart elements
    dataCanvas = svg.append('g')
      .attr('class', 'data-canvas')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    generalCanvas = dataCanvas.append('g')
      .attr('class', 'general-canvas');

    breakdownCanvas = dataCanvas.append('g')
      .attr('class', 'breakdown-canvas');

    breakdownCanvas.append('g')
      .attr('class', 'continent-labels');

    breakdownCanvas.append('g')
      .attr('class', 'subsector-labels')
      .attr('transform', 'translate(-50,40)');

    breakdownCanvas.append('g')
      .attr('class', 'circle-container')
      .attr('transform', 'translate(0,50)');
  };

  this.update = function () {
    if (this.data === null) {
      return;
    }
    this._calcSize();

    __currSection__ = this.data.section;

    let genRadiusExt = [5, 20];

    // ///////////////////////////////////
    // General section setup.
    let gen_numPerLine = 4;
    let gen_lineHeight = genRadiusExt[1] * 2 + 80;

    var gen_neededLines = Math.ceil(this.data.generalData.length / gen_numPerLine);
    var gen_yHeight = gen_neededLines * gen_lineHeight;                                 // The height should be set depending on what's being rendered.

    // Each spot should use 100px but there must always be space for all
    // the continents.
    let gen_maxSpots = Math.floor(_width / 100);
    let gen_spots = Math.max(gen_numPerLine, gen_maxSpots);

    xGeneral
      .domain(d3.range(0, gen_spots))
      .rangePoints([0, _width]);

    yGeneral
      .domain(d3.range(0, gen_neededLines))
      .rangeBands([0, gen_neededLines * gen_lineHeight]);

    rGeneral
      .domain(d3.extent(this.data.generalData, d => d[this.dataKey]))
      .range(genRadiusExt);

    // ///////////////////////////////////
    // Breakdown section setup.
    let brk_numPerLine = this.data.breakdownData.length;
    let brk_lineHeight = genRadiusExt[1] * 2;

    var brk_neededLines = Math.ceil(this.data.breakdownSubsectors.length);
    var brk_yHeight = brk_neededLines * brk_lineHeight;

    // Each spot should use 100px but there must always be space for all
    // the continents.
    let brk_maxSpots = Math.floor(_width / 100);
    let brk_spots = Math.max(brk_numPerLine, brk_maxSpots);

    xBreakdown
      .domain(d3.range(0, brk_spots))
      .rangePoints([0, _width]);

    yBreakdown
      .domain(d3.range(0, brk_neededLines))
      .rangePoints([0, brk_neededLines * brk_lineHeight]);

    rBreakdown
      .domain(d3.extent(this.data.breakdownData, d => d3.max(d, dd => dd[this.dataKey])))
      .range(genRadiusExt);

    // ///////////////////////////////////
    // MAIN chart elements
    // Height set on the update.
    if (__currSection__ === 'general') {
      svg
        .attr('width', _width + margin.left + margin.right)
        .attr('height', gen_yHeight + margin.top + margin.bottom);
      dataCanvas
        .attr('width', _width)
        .attr('height', gen_yHeight);
    } else if (__currSection__ === 'breakdown') {
      svg
        .attr('width', _width + margin.left + margin.right)
        .attr('height', brk_yHeight + margin.top + margin.bottom);
      dataCanvas
        .attr('width', _width)
        .attr('height', brk_yHeight);
    }

    // ///////////////////////////////////
    // General section chart elements.
    var lineDisplacement = function (i) {
      return yGeneral(Math.floor(i / gen_numPerLine));
    };
    var colDisplacement = function (i) {
      return xGeneral(i - Math.floor(i / gen_numPerLine) * gen_numPerLine);
    };

    var gen_thecircles = generalCanvas.selectAll('circle.continent-datum')
      .data(this.data.generalData);

    gen_thecircles.enter()
      .append('circle')
      .style('fill', d => dataSettings.geographies.get(d.continent).color)
      .style('cursor', 'pointer')
      .attr('class', 'continent-datum');

    gen_thecircles
      .on('click', function(d){
        if (!_this.nodeClickHandler){
          return;
        }
        _this.nodeClickHandler(d, true);
      });

    gen_thecircles
      .style('opacity', 1)
      .attr('cy', (d, i) => lineDisplacement(i) + genRadiusExt[1] + 5)
      .attr('cx', (d, i) => colDisplacement(i))
      .transition()
      .duration(500)
      .style('fill', d => dataSettings.geographies.get(d.continent).color)
      .attr('r', d => rGeneral(d[this.dataKey]));

    var gen_thelabels = generalCanvas.selectAll('text.continent-datum-label')
      .data(this.data.generalData);

    gen_thelabels.enter()
      .append('text')
      .attr('class', 'continent-datum-label')
      .style('text-anchor', 'middle');

    gen_thelabels
      .attr('x', (d, i) => colDisplacement(i))
      .attr('y', (d, i) => lineDisplacement(i) + genRadiusExt[1] * 2 + 10)
      .attr('dy', '1em')
      .style('opacity', 1)
      .text(d => d.continent);

    var gen_thevalues = generalCanvas.selectAll('text.continent-datum-value')
      .data(this.data.generalData);

    gen_thevalues.enter()
      .append('text')
      .attr('class', 'continent-datum-value')
      .style('text-anchor', 'middle');

    gen_thevalues
      .attr('x', (d, i) => colDisplacement(i))
      .attr('y', (d, i) => lineDisplacement(i) + genRadiusExt[1] * 2 + 10)
      .attr('dy', '2.5em')
      .style('opacity', 1)
      .text(d => {
        if (this.dataKey === 'raised') {
          return d.raised ? `$${formatCurrency(d.raised)}` : 'UNDISCLOSED';
        } else {
          return d.num;
        }
      });

    // ///////////////////////////////////
    // Breakdown chart elements.

    var brk_xlabels = breakdownCanvas.select('g.continent-labels')
      .selectAll('text.continent-datum-label')
        .data(this.data.breakdownContinents);

    brk_xlabels.enter()
      .append('text')
      .attr('class', 'continent-datum-label')
      .style('text-anchor', 'middle');

    brk_xlabels
      .attr('x', (d, i) => xBreakdown(i))
      .attr('y', (d, i) => 0)
      .attr('dy', '1em')
      .style('opacity', 1)
      .text(d => d);

    var brk_ylabels = breakdownCanvas.select('g.subsector-labels')
      .selectAll('text.subsector-datum-label')
        .data(this.data.breakdownSubsectors);

    brk_ylabels.enter()
      .append('text')
      .attr('class', 'subsector-datum-label')
      .style('text-anchor', 'end');

    brk_ylabels
      .attr('x', (d, i) => 0)
      .attr('y', (d, i) => yBreakdown(i))
      .attr('dy', '1em')
      .style('opacity', 1)
      .text(d => d)
      .call(wrap, 150);

    var brk_columns = breakdownCanvas.select('.circle-container')
      .selectAll('g.datum-columns')
        .data(this.data.breakdownData);

    brk_columns.enter()
      .append('g')
      .attr('class', 'datum-columns');

    brk_columns
      .style('opacity', 1)
      .attr('transform', 'translate(0,0)');

    var brk_thecircles = brk_columns.selectAll('circle.datum')
      .data(d => d);

    brk_thecircles.enter()
      .append('circle')
      .attr('class', 'datum')
      .attr('r', d => rBreakdown(d[this.dataKey]));
      

    brk_thecircles
      .style('opacity', 1)
      .style('cursor', 'pointer')
      .attr('cx', (d, i) => xBreakdown(this.data.breakdownContinents.indexOf(d.continent)))
      .attr('cy', (d, i) => yBreakdown(this.data.breakdownSubsectors.indexOf(d.subsector)))

      .on('click', function(d){
        if (!_this.nodeClickHandler){
          return;
        }
        _this.nodeClickHandler(d, false);
      });

    // ///////////////////////////////////
    // Transition

    // The __prevSection__ === null can later be used for entering animations.
    if (__prevSection__ === __currSection__ || __prevSection__ === null) {
      console.log('Same section', __currSection__);
      // Position elements according with current section.
      if (__currSection__ === 'general') {
        brk_xlabels
          .style('opacity', 0);

        brk_ylabels
          .style('opacity', 0);

        brk_thecircles
          .style('opacity', 0);

        breakdownCanvas.selectAll('.datum-columns')
          .style('opacity', 0);
        //
      } else if (__currSection__ === 'breakdown') {
        gen_thecircles
        .style('opacity', 0);

        gen_thelabels
          .style('opacity', 0);

        gen_thevalues
          .style('opacity', 0);
      }

      //
    } else if (__prevSection__ === 'general' && __currSection__ === 'breakdown') {
      console.log('general ==> breakdown');
      // Set initial state of the breakdown chart
      brk_xlabels
        .style('opacity', 0)
        .attr('y', -20);

      brk_ylabels
        .style('opacity', 0)
        .selectAll('tspan')
        .attr('x', -100);

      breakdownCanvas.selectAll('.datum-columns')
        .style('opacity', 0)
          .attr('transform', (d, i) => 'translate(-100,0)');

      // vv Start hide general
      gen_thecircles.transition()
        .duration(250)
        .style('opacity', 0)
        .attr('r', 0);

      gen_thelabels.transition()
        .duration(300)
        .style('opacity', 0)
        .attr('y', function (d) {
          return d3.select(this).attr('y') - 10;
        });

      gen_thevalues.transition()
        .duration(300)
        .style('opacity', 0)
        .attr('y', function (d) {
          return d3.select(this).attr('y') - 10;
        });
      // ^^ End hide general

      // vv Start show breakdown
      brk_xlabels.transition()
        .delay(500)
        .duration(300)
        .style('opacity', 1)
        .attr('y', 0);

      brk_ylabels.transition()
        .delay((d, i) => i * 50 + 500)
        .style('opacity', 1)
        .duration(300)
        .selectAll('tspan')
          .attr('x', 0);

      breakdownCanvas.selectAll('.datum-columns')
        .transition()
          .duration(500)
          .delay(500)
          .delay((d, i) => i * 100 + 500)
          .style('opacity', 1)
          .attr('transform', 'translate(0,0)');
      //
    } else if (__prevSection__ === 'breakdown' && __currSection__ === 'general') {
      console.log('breakdown ==> general');
      // Set initial state of the general chart
      svg
        .attr('height', brk_yHeight + margin.top + margin.bottom);
      dataCanvas
        .attr('height', brk_yHeight);

      gen_thecircles
        .style('opacity', 0)
        .attr('r', 0);

      gen_thelabels
        .style('opacity', 0)
        .attr('y', function (d) {
          return d3.select(this).attr('y') - 10;
        });

      gen_thevalues
        .style('opacity', 0)
        .attr('y', function (d) {
          return d3.select(this).attr('y') - 10;
        });

      // vv Start hide breakdown
      brk_xlabels.transition()
        .delay(250)
        .duration(300)
        .style('opacity', 0)
        .attr('y', -20);

      brk_ylabels.transition()
        .delay((d, i) => (brk_ylabels[0].length - i - 1) * 50)
        .duration(300)
        .style('opacity', 0)
        .selectAll('tspan')
          .attr('x', -100);

      breakdownCanvas.selectAll('.datum-columns')
        .transition()
          .duration(250)
          .delay((d, i) => i * 100 + 500)
          .style('opacity', 1)
          .attr('transform', 'translate(0,0)');

      breakdownCanvas.selectAll('.datum-columns')
        .transition()
          .duration(250)
          .delay((d, i) => (i * 100))
          .style('opacity', 0)
          .attr('transform', (d, i) => 'translate(-100,0)');
      // ^^ End hide breakdown

      // vv Start show general
      gen_thecircles.transition()
        .delay(750)
        .duration(250)
        .style('opacity', 1)
        .attr('r', d => rGeneral(d[this.dataKey]));

      gen_thelabels.transition()
        .delay(750)
        .duration(300)
        .style('opacity', 1)
        .attr('y', (d, i) => lineDisplacement(i) + genRadiusExt[1] * 2 + 10);

      gen_thevalues.transition()
        .delay(750)
        .duration(300)
        .style('opacity', 1)
        .attr('y', (d, i) => lineDisplacement(i) + genRadiusExt[1] * 2 + 10);
      // ^^ End show general

      svg.transition().delay(500)
        .attr('height', gen_yHeight + margin.top + margin.bottom);
      dataCanvas.transition().delay(500)
        .attr('height', gen_yHeight);
    }

    __prevSection__ = __currSection__;
  };

  this.destroy = function () {

  };

  // ------------------------------------------------------------------------ //
  // 3... 2... 1... GO...
  this._init();
  this.setData(data);
};

function wrap (text, width) {
  text.each(function () {
    var text = d3.select(this);
    var words = text.text().split(/\s+/).reverse();
    var word;
    var line = [];
    var lineNumber = 0;
    var lineHeight = 1.1; // ems
    var y = text.attr('y');
    var dy = parseFloat(text.attr('dy'));
    var tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(' '));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(' '));
        line = [word];
        tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
      }
    }
    // Center vertically.
    if (lineNumber) {
      let adjustment = lineHeight * lineNumber / 2;
      text.selectAll('tspan')
        .attr('dy', function (d) {
          let ts = d3.select(this);
          return parseFloat(ts.attr('dy')) - adjustment + 'em';
        });
    }
  });
}
