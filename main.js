import 'babel-polyfill';
// React views
import React from 'react';
import { render } from 'react-dom';

// Routing
import { Router, Route, IndexRoute } from 'react-router';
import { syncReduxAndRouter } from 'redux-simple-router';
import { createHashHistory } from 'history';

// Redux store
import { createStore, applyMiddleware, compose } from 'redux';
// React binding for Redux
import { Provider } from 'react-redux';
import {enableBatching} from 'redux-batched-actions';
import thunkMiddleware from 'redux-thunk';
// development
// TODO: put undef configuration management
//import DevTools from './components/dev-tools';

// data reduction
import reducer from './reducers/reducer';

// views
import Master from './views/master';
import App from './views/app';
import Investor from './views/investor';
import Company from './views/company';
import UhOh from './views/uhoh';
import Home from './views/home';
import About from './views/about';
import Faq from './views/faq';
import Explore from './views/explore';
import Search from './views/search'

//----------------------------------
// MANAGE DATA WITH REDUX
// ---------------------------------

// CREATE ENHANCED STORE
const createEnhancedStore = compose(
    // Middleware you want to use in development:
    applyMiddleware(thunkMiddleware)
    // Required! Enable Redux DevTools with the monitors you chose.
    // DevTools.instrument()
)(createStore);
const store = createEnhancedStore(enableBatching(reducer));

// Sync store and router
const history = createHashHistory();
syncReduxAndRouter(history, store);


render((
    /* Provider makes Redux store available to `connect` calls in component hierarchy */
    <Provider store={store}>
        <Router history={history}>
            <Route path='/' component={App}>

                {/* Homepage, containing all insights nee trends */}
                <IndexRoute component={Master}/>

                {/* Investor and company pages */}
                <Route path='investor/:investorId' component={Investor}/>
                <Route path='company/:companyId' component={Company}/>

                {/* Investor and company pages */}
                <Route path='about' component={About}/>
                <Route path='faq' component={Faq}/>
                <Route path='explore' component={Explore}/>
                <Route path='search/:searchKeyword' component={Search}/>
            </Route>
            <Route path='*' component={UhOh}/>
        </Router>
    </Provider>
), document.querySelector('#site-canvas'));
