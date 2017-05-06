import _ from 'lodash';
import { combineReducers } from 'redux';
import { routeReducer } from 'redux-simple-router';

import * as actions from '../actions/action-types';
import pluckUnique from '../utils/pluck-unique';

const investments = function (state = {items: []}, action) {
  switch (action.type) {
    case actions.REQUEST_INVESTMENTS:
      console.log('REQUEST_INVESTMENTS');
      state = _.cloneDeep(state);
      state.fetching = true;
      break;
    case actions.RECEIVE_INVESTMENTS:
      console.log('RECEIVE_INVESTMENTS');
      state = _.cloneDeep(state);
      state.items = action.items;
      state.fetching = false;
      break;
  }
  return state;
};

const connectedInvestments = function (state = {items: []}, action) {
  switch (action.type) {
    case actions.REQUEST_CONNECTED_INVESTMENTS:
      console.log('REQUEST_CONNECTED_INVESTMENTS');
      state = _.cloneDeep(state);
      state.fetching = true;
      break;
    case actions.RECEIVE_CONNECTED_INVESTMENTS:
      console.log('RECEIVE_CONNECTED_INVESTMENTS');
      state = _.cloneDeep(state);
      state.items = action.items;
      state.fetching = false;
      break;
  }
  return state;
};

const totalNumbers = function (state = {data: null, fetching: false}, action) {
  switch (action.type) {
    case actions.REQUEST_TOTAL_NUMBERS:
      console.log('REQUEST_TOTAL_NUMBERS');
      state = _.cloneDeep(state);
      state.fetching = true;
      break;
    case actions.RECEIVE_TOTAL_NUMBERS:
      console.log('RECEIVE_TOTAL_NUMBERS');
      state = _.cloneDeep(state);
      state.data = action.data;
      state.fetching = false;
      break;
  }
  return state;
};

const trends = function (state = {activeSection: 'general', activeFilter: 'all'}, action) {
  switch (action.type) {
    case actions.SET_TRENDS_FILTER:
      console.log('SET_TRENDS_FILTER');
      state = _.cloneDeep(state);
      state.activeFilter = action.filter;
      break;
    case actions.SET_TRENDS_SECTION:
      console.log('SET_TRENDS_SECTION');
      state = _.cloneDeep(state);
      state.activeSection = action.section;
      break;
  }
  return state;
};

const investor = function (state = {fetching: false, data: null, activeTab: 'overview'}, action) {
  switch (action.type) {
    case actions.REQUEST_INVESTOR:
      console.log('REQUEST_INVESTOR');
      state = _.cloneDeep(state);
      state.fetching = true;
      break;
    case actions.RECEIVE_INVESTOR:
      console.log('RECEIVE_INVESTOR');
      state = _.cloneDeep(state);
      state.data = action.data;
      state.fetching = false;
      break;
    case actions.SET_INVESTOR_TAB:
      console.log('SET_INVESTOR_TAB');
      state = _.cloneDeep(state);
      state.activeTab = action.tab;
      break;
  }
  return state;
};

const investorDetails  = function(state = { fetching: false, data: null }, action) {
  switch (action.type) {
    case actions.REQUEST_INVESTOR_DETAILS:
      console.log('REQUEST_INVESTOR');
      state = _.cloneDeep(state);
      state.fetching = true;
      break;
    case actions.RECEIVE_INVESTOR_DETAILS:
      console.log('RECEIVE_INVESTOR');
      state = _.cloneDeep(state);
      state.data = action.data;
      state.fetching = false;
      console.log("OMG FIRST TRY!", action.data);
      break;
  }

  return state;
};

const search = function(state = {fetching: false, data: null}, action) {
  switch (action.type) {
    case actions.SEARCH_REQUESTED:
      console.log('SEARCH REQUESTED');
      state = _.cloneDeep(state);
      state.fetching = true;
      break;
    case actions.SEARCH_RECEIVED:
      console.log('SEARCH_RECEIVED');
      state = _.cloneDeep(state);
      state.data = action.data;
      console.log("QUERY RESULTZZZZ", state.data);
      break;
  }
  return state;
};

const company = function (state = {fetching: false, data: null, activeTab: 'overview'}, action) {
  switch (action.type) {
    case actions.REQUEST_COMPANY:
      console.log('REQUEST_COMPANY');
      state = _.cloneDeep(state);
      state.fetching = true;
      break;
    case actions.RECEIVE_COMPANY:
      console.log('RECEIVE_COMPANY');
      state = _.cloneDeep(state);
      state.data = action.data;
      state.fetching = false;
      break;
    case actions.SET_COMPANY_TAB:
      console.log('SET_COMPANY_TAB');
      state = _.cloneDeep(state);
      state.activeTab = action.tab;
      break;
  }
  return state;
};

const exploreDefState = {
  isLoading: true,
  sectors: [],
  geographies: [],
  nlForm: {
    activeOpts: {
      type: 'investors',
      sector: null,
      geography: null
    },
    fieldOpts: {
      type: [
        {
          key: 'investors',
          value: 'investors'
        },
        {
          key: 'companies',
          value: 'companies'
        }
      ],
      sector: [],
      geography: []
    }
  },
  sort: {
    field: 'name',
    order: 'asc'
  }
};

const explore = function (state = exploreDefState, action) {


  switch (action.type) {
    case actions.RECEIVE_INVESTMENTS:
      state = _.cloneDeep(state);
      state.isLoading = false;
      // Compute sectors.
      state.sectors = pluckUnique(action.items, 'subsector');
      // Compute geographies.
      state.geographies = pluckUnique(action.items, 'continent');

      state.nlForm.fieldOpts.sector = _.map(state.sectors, o => { return {key: o, value: o}; });
      state.nlForm.fieldOpts.sector.unshift({
        key: 'all',
        value: 'all issues'
      });
      state.nlForm.fieldOpts.geography = _.map(state.geographies, o => { return {key: o, value: o}; });
      state.nlForm.fieldOpts.geography.unshift({
        key: 'all',
        value: 'all geographies'
      });

      state.nlForm.activeOpts.sector = state.nlForm.fieldOpts.sector[0].key;
      state.nlForm.activeOpts.geography = state.nlForm.fieldOpts.geography[0].key;
      break;
    case actions.SET_EXPLORE_FILTERS:
      state = _.cloneDeep(state);
      state.nlForm.activeOpts = _.clone(action.filters);
      break;
    case actions.SET_EXPLORE_TABLE_SORT:
      state = _.cloneDeep(state);
      state.sort.field = action.field;
      state.sort.order = action.order;
      break;
  }
  return state;
};

export default combineReducers({
  investments,
  connectedInvestments,
  totalNumbers,
  trends,
  investor,
  investorDetails,
  company,
  explore,
  search,
  routing: routeReducer
});
