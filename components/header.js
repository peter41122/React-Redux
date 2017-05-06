'user strict';
import React from 'react';
import { Link } from 'react-router';

import Dropdown from './dropdown';

//window.React = React; // IS THIS NECESSARY

// This is a presentational component.
const Header = React.createClass({
    render: function() {
        return (
            <header className='site-header' role='banner'>
                <div className='inner'>
                    <div className='site-headline'>
                        <h1 className='site-title'><Link to={''}>Impact Investing <p>Network Map</p></Link></h1>
                    </div>
                    <nav className='site-nav' role='navigation'>
                    <input type="checkbox" name="navMobile" id="navMobile" />
                    <label htmlFor="navMobile"></label>
                        <ul className='site-nav-links'>
                            <li><Link to='/explore'>The Network</Link></li>
                            <li><Link to='/'>Insights</Link></li>
                            <li><a href='http://impactspace.com/addtoimpactspace' target='_new'>Submit Data</a></li>
                            <li><Link to={'/faq'}>FAQ</Link></li>
                            <li><Link to={'/about'}>About</Link></li>
                        </ul>
                    </nav>
                </div>
                <div className='blur-back'></div>
            </header>
        )
    }
});

module.exports = Header;





// <Dropdown element='li' className='dropdown center' triggerTitle='View Trends' triggerText='Insights'>
//                                 <ul className='trends-dropdown'>
//                                     <li><Link to={'/trends/connectedness'} data-hook='dropdown:close'>Connectedness</Link></li>
//                                     <li><Link to={'/trends/geography'} data-hook='dropdown:close'>Geography</Link></li>
//                                     <li><Link to={'/trends/sector'} data-hook='dropdown:close'>Sector</Link></li>
//                                     <li><Link to={'/trends/rounds'} data-hook='dropdown:close'>Rounds</Link></li>
//                                 </ul>
//                             </Dropdown>
