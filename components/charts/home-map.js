'use strict';
import * as fs from 'fs';

import React from 'react';
import _ from 'lodash';
import d3 from 'd3';

//var mis = JSON.parse(fs.readFileSync('./miserables.json', 'utf8'));
//
//var lesMis = {
//
//}
var mis =
{
    "nodes":[
    {"name":"Myriel","group":1},
    {"name":"Napoleon","group":1},
    {"name":"Mlle.Baptistine","group":1},
    {"name":"Mme.Magloire","group":1},
    {"name":"Cravatte","group":1},
    {"name":"Count","group":1},
    {"name":"OldMan","group":1},
    {"name":"Labarre","group":2},
    {"name":"Valjean","group":2},
    {"name":"Marguerite","group":3},
    {"name":"Mme.deR","group":2},
    {"name":"Isabeau","group":2},
    {"name":"CountessdeLo","group":1},
    {"name":"Geborand","group":1},
    {"name":"Champtercier","group":1}
    ],
    "links":[
    {"source":1,"target":0,"value":1},
    {"source":2,"target":0,"value":8},
    {"source":3,"target":0,"value":10},
    {"source":3,"target":0,"value":6},
    {"source":4,"target":0,"value":1},
    {"source":5,"target":0,"value":1}
    ]
};

var HomeMap = React.createClass({
    // is className really necessary
    propTypes: {
        className: React.PropTypes.string
    },

    chart: null,

    makeChart: function() {
        var width = 960,
            height = 500;

        var color = d3.scale.category20();

        var force = d3.layout.force()
            .charge(-120)
            .linkDistance(30)
            .size([width, height]);

        var svg = d3.select("#d333").append("svg")
            .attr("width", width)
            .attr("height", height);

        force
            .nodes(mis.nodes)
            .links(mis.links)
            .start();

        var link = svg.selectAll(".link")
            .data(mis.links)
            .enter().append("line")
            .attr("class", "link")
            .style("stroke-width", function(d) { return Math.sqrt(d.value); });

        var node = svg.selectAll(".node")
            .data(mis.nodes)
            .enter().append("circle")
            .attr("class", "node")
            .attr("r", 30)
            .style("fill", function(d) { return color(d.group); })
            .call(force.drag);

        node.append("title")
            .text(function(d) { return d.name; });

        force.on("tick", function() {
            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
        });

    },

    onWindowResize: function(){
        console.log("Window resized");
    },

    componentDidMount: function() {
        //Dobounce event
        //this.onWindowResize = _.debounce(this.onWindowResize, 200);
        //window.addEventListener('resize', this.onWindowResize);
        //this.chart = new Chart(this.refs.chart, this.props);
        this.makeChart();

    },
    render: function() {
        return (
            <div className="home-map" id="d333" ref="chart">
                ur at least here
            </div>)
    }
});


module.exports = HomeMap;
