'use strict';
import React from 'react';
import _ from 'lodash';
import d3 from 'd3';
import Popover from '../../utils/popover';

var NetworkMap = React.createClass({
  propTypes: {
    className: React.PropTypes.string
  },

  chart: null,

  onWindowResize: function () {
    this.chart.update();
  },

  componentDidMount: function () {
    // Debounce event.
    this.onWindowResize = _.debounce(this.onWindowResize, 200);

    window.addEventListener('resize', this.onWindowResize);
    this.chart = new Chart(this.refs.chart, this.props);
  },

  componentWillUnmount: function () {
    window.removeEventListener('resize', this.onWindowResize);
    this.chart.destroy();
  },

  componentDidUpdate: function (/* prevProps, prevState */) {
    this.chart.setData(this.props);
  },

  render: function () {
    let klass = 'network-map';
    if (this.props.className) {
      klass += ' ' + this.props.className;
    }
    return (
      <div ref='chart' className={klass}></div>
    );
  }
});

var Chart = function (el, data) {
  this.$el = d3.select(el);

  this.data = null;
  this.xData = null;
  this.yData = null;

  var _this = this;

  // Var declaration.
  var margin = {top: 16, right: 16, bottom: 16, left: 16};
  // width and height refer to the data canvas. To know the svg size the margins
  // must be added.
  var _width, _height;
  // Scales and force functions.
  var x, amountScale, force;
  // Elements.
  var svg, dataCanvas;
  var nodeR = 15;
  // Init the popover.
  var chartPopover = new Popover();

  this._calcSize = function () {
    _width = parseInt(this.$el.style('width'), 10) - margin.left - margin.right;
    _height = parseInt(this.$el.style('height'), 10) - margin.top - margin.bottom;
  };

  this.setData = function (data) {
    var _data = _.cloneDeep(data);
    this.popoverContentFn = _data.popoverContentFn;
    this.nodeClickHandler = _data.nodeClickHandler;
    this.processData(_data);
    this.update();
  };

  this.processData = function (data) {
    let investments = data.investments;

    // console.time('Group investments');
    var inv = _(investments)
      .groupBy(o => `${o.investor_id}-${o.company_id}`)
      .values()
      .map(o => _.reduce(o, (result, obj, key) => {
        obj.raised = +(obj.raised);
        if (result === null) {
          return _.cloneDeep(obj);
        }

        result.raised += parseFloat(obj.raised, 10);

        return result;
      }, null))
      .value();
    // console.timeEnd('Group investments');

    // console.time('Get companies & investors');
    var companies = {};
    var investors = {};
    _.forEach(inv, o => {
      companies[o.company_id] = {
        id: `c${o.company_id}`,
        _id: o.company_id,
        name: o.company_name,
        type: 'company',
        main: _.contains(data.mainNodeIds, `c${o.company_id}`)
      };
      investors[o.investor_id] = {
        id: `i${o.investor_id}`,
        _id: o.investor_id,
        name: o.investor_name,
        type: 'investor',
        main: _.contains(data.mainNodeIds, `i${o.investor_id}`)
      };
    });
    companies = _.values(companies);
    investors = _.values(investors);
    // console.timeEnd('Get companies & investors');

    // console.time('Nodes and Links');

    var nodes = investors.concat(companies);

    var links = _.map(inv, o => {
      o.source = _.find(nodes, 'id', `i${o.investor_id}`);
      o.target = _.find(nodes, 'id', `c${o.company_id}`);
      return o;
    });

    this.data = {
      links,
      nodes
    };

    this.settings = {};
    if (data.exploreType == null || data.exploreType == undefined)
      this.settings.mode = 'home';
    else{
      this.settings.mode = 'explore';
      this.settings.type = data.exploreType;
    }

    // console.timeEnd('Nodes and Links');
  };

  this._init = function () {
    this._calcSize();

    // The svg.
    svg = this.$el.append('svg')
      .attr('class', 'chart');

    dataCanvas = svg.append('g')
      .attr('class', 'data-canvas');

    // X scale. Domain updated in function.
    x = d3.scale.linear()
      .range([1, 6]);

    // amountScale scale. Domain updated in function.
    amountScale = d3.scale.linear()
      .range([5, 20]);

    force = d3.layout.force()
      .gravity(0.3)
      .charge(-750)
      .theta(0.1)
      .linkDistance(d => {
        return d.source.main || d.target.main ? 80 : 20;
      })
      .size([_width, _height]);
  };

  this.update = function () {
    if (this.data === null) {
      return;
    }
    this._calcSize();

    x.domain(d3.extent (this.data.links, (d) => d.foi_size));

    amountScale.domain(d3.extent(this.data.nodes, (d) => d.size));

    

    svg
      .attr('width', _width)
      .attr('height', _height);

    force
      .nodes(this.data.nodes)
      .links(this.data.links)
      .start();

// Sorting process
    var processed_companies = _.filter(this.data.nodes, function(obj){return obj.type=="company";});
    processed_companies = _.sortBy(processed_companies, 'raised');
    var processed_investors = _.filter(this.data.nodes, function(obj){return obj.type=="investor";});
    processed_investors = _.sortBy(processed_investors, 'weight');

    var arr_to_sort;

    switch (this.settings.mode){
      case 'explore':
        if (this.settings.type == 'investor'){
          arr_to_sort = processed_investors;
        }else {
          arr_to_sort = processed_companies;
        }

        console.log("New array length : " + arr_to_sort.length);
        var top5_cursor = 0;
        for (var i = arr_to_sort.length-1; i >= 0; i--){
          if (arr_to_sort[i].main && (top5_cursor<5)){
            arr_to_sort[i].top5 = true;
            top5_cursor ++;            
          }else
            arr_to_sort[i].top5 = false;

        }
        break;
      case 'home':
        arr_to_sort = processed_investors;

        for (var i = 0; i < arr_to_sort.length; i++){
          if (i >= arr_to_sort.length - 5)
            arr_to_sort[i].top5 = true;
          else
            arr_to_sort[i].top5 = false;
        }
        break;
      default:
        arr_to_sort = processed_investors;
        break;
    }

    this.data.nodes = processed_companies.concat(processed_investors);

    

    var links = dataCanvas.selectAll('.link').data(this.data.links);

    links.enter()
      .append('line')
      .attr('class', 'link');

    links.exit()
      .remove();

    var nodes = dataCanvas.selectAll('g.node').data(this.data.nodes);

    nodes.enter()
      .append('g')
       .call(force.drag)
      .on('mouseover', function (d) {
        if (!_this.popoverContentFn) {
          return;
        }
        var matrix = this.getScreenCTM()
          .translate(this.getAttribute('cx'), this.getAttribute('cy'));

        var posX = window.pageXOffset + matrix.e;
        var posY = window.pageYOffset + matrix.f - 16;

        chartPopover.setContent(_this.popoverContentFn(d)).show(posX, posY);

        let ids = [];
        dataCanvas.selectAll('.link')
          .style('opacity', o => {
            if (d.type === 'investor') {
              if (o.investor_id === d._id) {
                ids.push(o.company_id);
                return 1;
              } else {
                return 0.3;
              }
            } else if (d.type === 'company') {
              if (o.company_id === d._id) {
                ids.push(o.investor_id);
                return 1;
              } else {
                return 0.3;
              }
            }
          });

        dataCanvas.selectAll('.node')
          .style('opacity', o => {
            if (d.id === o.id) {
              return 1;
            }
            let res = 0.4;
            if ((d.type === 'investor' && o.type === 'company') || (d.type === 'company' && o.type === 'investor')) {
              // Over an investor connecting to a company.
              if (_.contains(ids, o._id)) {
                res = 1;
              }
            }
            return res;
          });
      })
      .on('mouseout', function (d) {
        links.style('opacity', '');
        nodes.style('opacity', '');

        if (!_this.popoverContentFn) {
          return;
        }
        chartPopover.hide();
      })
      .on('click', function (d) {
        if (!_this.nodeClickHandler) {
          return;
        }
        chartPopover.hide();
        _this.nodeClickHandler(d);
      });

    var circles = nodes.selectAll('circle').data(d => [d]);
    var labels = nodes.selectAll('text').data(d => [d]);
    
    circles.enter().append('circle');
    circles
      .attr('r', d => {
        console.log("Circle R: " + nodeR);
        if(d.type === "investor") {
          return nodeR + d.weight;
        } else {
          return nodeR;
        }
      })
      .attr('class', d => {
        return `${d.type}`;
      });

   labels.enter().append('text');
   labels
    .text(d => {
      if (d.top5)
        return d.name;
      else
        return '';
    })
    .style('text-anchor', 'middle')
    .style('fill', '#4a4a4a')
    .attr('x', d => 0)
    .attr('class','bubble-label');

    nodes
      .attr('class', d => {
        return `node ${d.type} ${d.main ? ' main' : ''}`;
      });

    nodes.exit()
      .remove();

    var radiusOffset = function (axis, r, x0, x1, y0, y1) {
      let dx = x1 - x0;
      let dy = y1 - y0;

      let d = Math.sqrt(dx * dx + dy * dy);
      let ratio = r / d;

      return axis === 'x' ? x0 + dx * ratio : y0 + dy * ratio;
    };

    force.on('tick', () => {
      links
        .attr('x1', (d) => radiusOffset('x', nodeR, d.source.x, d.target.x, d.source.y, d.target.y))
        .attr('y1', (d) => radiusOffset('y', nodeR, d.source.x, d.target.x, d.source.y, d.target.y))
        .attr('x2', (d) => radiusOffset('x', nodeR, d.target.x, d.source.x, d.target.y, d.source.y))
        .attr('y2', (d) => radiusOffset('y', nodeR, d.target.x, d.source.x, d.target.y, d.source.y));

      // nodes
      //   .attr('cx', (d) => d.x)
      //   .attr('cy', (d) => d.y);
      nodes
        .attr('transform', d => {
          d.x = Math.max(nodeR, Math.min(_width - nodeR, d.x));
          d.y = Math.max(nodeR, Math.min(_height - nodeR, d.y));
          return `translate(${d.x},${d.y})`;
        });
        /*
      nodes
        .attr('cx', d => {
          d.x = Math.max(nodeR, Math.min(_width - nodeR, d.x));
          return d.x;
        })
        .attr('cy', d => {
          d.y = Math.max(nodeR, Math.min(_height - nodeR, d.y));
          return d.y;
        });*/
    });
  };

  this.destroy = function () {
    chartPopover.hide();
  };

  // --------------------------------------------------------------------------//
  // 3... 2... 1... GO...
  this._init();
  this.setData(data);
};

module.exports = NetworkMap;
