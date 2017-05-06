'use strict';
import React from 'react';

//import { fetchConnectedInvestments } from '../actions/action-creators';
import Home from './home';
// import HomeMap from '../components/charts/home-map.js';
import Trends from './trends';

var Master = React.createClass({
    render: function() {
        return (
            <div className="master">
                <Home />
                <Trends />
            </div>
        )
    }
});



module.exports = Master;
