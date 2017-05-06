import _ from 'lodash';
import fetch from 'isomorphic-fetch';
import * as actions from './action-types';
import config from '../config';

// ////////////////////////////////////////////////////////////////////////////
// //// Fetch Investments Thunk
function isQuotaExceeded (e) {
  var quotaExceeded = false;
  if (e) {
    if (e.code) {
      switch (e.code) {
        case 22:
          quotaExceeded = true;
          break;
        case 1014:
          // Firefox
          if (e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            quotaExceeded = true;
          }
          break;
      }
    } else if (e.number === -2147024882) {
      // Internet Explorer 8
      quotaExceeded = true;
    }
  }
  return quotaExceeded;
}

function requestInvestments () {
  return {
    type: actions.REQUEST_INVESTMENTS
  };
}

function receiveInvestments (json) {
  return {
    type: actions.RECEIVE_INVESTMENTS,
    items: json,
    receivedAt: Date.now()
  };
}

export function fetchInvestments () {
  return dispatch => {
    dispatch(requestInvestments());

    if (window.localStorage) {
      try {
        var stored = JSON.parse(window.localStorage.getItem('ii--investments'));
        if (stored && stored.expire > Date.now()) {
          console.info('investments from localStorage');
          dispatch(receiveInvestments(stored.data));
          return;
        }
      } catch (e) {
        // Ignore.
      }
      console.info('localStorage cache expired or non existent');
    }

    // The function called by the thunk middleware can return a value,
    // that is passed on as the return value of the dispatch method.

    // In this case, we return a promise to wait for.
    // This is not required by thunk middleware, but it is convenient for us.
    // return fetch(`/investments.json`)
    return fetch(`${config.api}/investments/map`)
      .then(response => response.json())
      .then(json => {
        // console.log('description', _.filter(json, o => (o.investor_name && !o.is_investor_id)));
        json = _.filter(json, o => o.investor_id && o.company_id);
        // json = _.filter(json, o => o.investor_name && o.company_name);

        if (window.localStorage) {
          try {
            let toStore = { expire: Date.now() + 60 * 60 * 1000, data: json };
            window.localStorage.setItem('ii--investments', JSON.stringify(toStore));
          } catch (e) {
            if (isQuotaExceeded(e)) {
              window.localStorage.clear();
            }
          }
        }

        dispatch(receiveInvestments(json));
      });

      // In a real world app, you also want to
      // catch any error in the network call.
  };
}

// ////////////////////////////////////////////////////////////////////////////
// //// Fetch Most Connected Investments Thunk

function requestConnectedInvestments () {
  return {
    type: actions.REQUEST_CONNECTED_INVESTMENTS
  };
}

function receiveConnectedInvestments (json) {
  return {
    type: actions.RECEIVE_CONNECTED_INVESTMENTS,
    items: json,
    receivedAt: Date.now()
  };
}

function requestTotalNumbers () {
  return {
    type: actions.REQUEST_TOTAL_NUMBERS
  };
}

function receiveTotalNumbers (json) {
  return {
    type: actions.RECEIVE_TOTAL_NUMBERS,
    data: json
  }
}

export function fetchTotalNumbers () {
  return dispatch => {
    dispatch(requestTotalNumbers());

    return fetch(`${config.api}/totals`)
      .then(response => response.json())
      .then(json => {
        dispatch(receiveTotalNumbers(json));
      });
  }
}
export function fetchConnectedInvestments () {
  return dispatch => {
    dispatch(requestConnectedInvestments());

    // The function called by the thunk middleware can return a value,
    // that is passed on as the return value of the dispatch method.

    // In this case, we return a promise to wait for.
    // This is not required by thunk middleware, but it is convenient for us.
    return fetch(`${config.api}/investors/most-connected/investments`)
      .then(response => response.json())
      .then(json => {
        dispatch(receiveConnectedInvestments(json));
      });

      // In a real world app, you also want to
      // catch any error in the network call.
  };
}

// ////////////////////////////////////////////////////////////////////////////
// //// Fetch Investor by id Thunk

function requestInvestor () {
  return {
    type: actions.REQUEST_INVESTOR
  };
}

function receiveInvestor (json) {
  return {
    type: actions.RECEIVE_INVESTOR,
    data: json,
    receivedAt: Date.now()
  };
}

export function fetchInvestor (id) {
  return dispatch => {
    dispatch(requestInvestor());

    // The function called by the thunk middleware can return a value,
    // that is passed on as the return value of the dispatch method.

    // In this case, we return a promise to wait for.
    // This is not required by thunk middleware, but it is convenient for us.
    // return fetch(`/investments.json`)
    return fetch(`${config.api}/investors/map/${id}?people=1`)
      .then(response => response.json())
      .then(json => {
        // TODO: Handle not found.
        dispatch(receiveInvestor(json));
      });

      // In a real world app, you also want to
      // catch any error in the network call.
  };
}

// Fetch investor Details stuff

function requestInvestorDetails() {
  return {
    type: actions.REQUEST_INVESTOR_DETAILS
  }
}


function receiveInvestorDetails(json) {
  return {
    type: actions.RECEIVE_INVESTOR_DETAILS,
    data: json,
    receivedAt: Date.now()
  }
}


export function fetchInvestorDetails(id) {
  return dispatch => {
    dispatch(requestInvestorDetails());

    return fetch(`${config.api}/investors/map/${id}/details`)
      .then(response => response.json())
      .then(json => {
          //TODO: handle not found
        dispatch(receiveInvestorDetails(json))
      })
  }
}

// tabs

export function setInvestorTab (tab) {
  return {
    type: actions.SET_INVESTOR_TAB,
    tab
  };
}

//////////////////////////
// Search

function requestSearch(query) {
  return {
    type: actions.SEARCH_REQUESTED
  }
}

function receiveSearch (json) {
  return {
    type: actions.SEARCH_RECEIVED,
    data: json,
    receivedAt: Date.now()
  };
}

export function fetchSearchResults (queryString) {
  return dispatch => {
    dispatch(requestSearch());


    // The function called by the thunk middleware can return a value,
    // that is passed on as the return value of the dispatch method.

    // In this case, we return a promise to wait for.
    // This is not required by thunk middleware, but it is convenient for us.
    // return fetch(`/investments.json`)
    return fetch(`${config.api}/search?q=${queryString}`)
        .then(response => response.json())
        .then(json => {
          // TODO: Handle not found.
          dispatch(receiveSearch(json));
        });

    // In a real world app, you also want to
    // catch any error in the network call.
  };
}

// ////////////////////////////////////////////////////////////////////////////
// //// Fetch Company by id Thunk

function requestCompany () {
  return {
    type: actions.REQUEST_COMPANY
  };
}

function receiveCompany (json) {
  return {
    type: actions.RECEIVE_COMPANY,
    data: json,
    receivedAt: Date.now()
  };
}

export function fetchCompany (id) {
  return dispatch => {
    dispatch(requestCompany());

    // The function called by the thunk middleware can return a value,
    // that is passed on as the return value of the dispatch method.

    // In this case, we return a promise to wait for.
    // This is not required by thunk middleware, but it is convenient for us.
    // return fetch(`/investments.json`)
    return fetch(`${config.api}/companies/map/${id}?people=1`)
      .then(response => response.json())
      .then(json => {
        // TODO: Handle not found.
        dispatch(receiveCompany(json));
      });

      // In a real world app, you also want to
      // catch any error in the network call.
  };
}

export function setCompanyTab (tab) {
  return {
    type: actions.SET_COMPANY_TAB,
    tab
  };
}

// ////////////////////////////////////////////////////////////////////////////
// //// Tends section related actions

export function setTrendsFilter (filter) {
  return {
    type: actions.SET_TRENDS_FILTER,
    filter
  };
}

export function setTrendsSection (section) {
  return {
    type: actions.SET_TRENDS_SECTION,
    section
  };
}

// ////////////////////////////////////////////////////////////////////////////
// //// Explore related actions

export function setExploreFilters (filters) {
  return {
    type: actions.SET_EXPLORE_FILTERS,
    filters
  };
}

export function setExploreTableSort (field, order) {
  return {
    type: actions.SET_EXPLORE_TABLE_SORT,
    field,
    order
  };
}
