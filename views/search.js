import React from 'react';
import { connect } from 'react-redux';

import { fetchSearchResults } from '../actions/action-creators';

import InvestorResults from '../components/search/investors';
import CompanyResults from '../components/search/companies';
import CompanyPeopleResults from '../components/search/company_people';
import InvestorPeopleResults from '../components/search/investor_people';
import Header from '../components/header';
import SearchBar from '../components/search-bar';


var Search = React.createClass({
    propTypes: {
        dispatch: React.PropTypes.func,
        location: React.PropTypes.object,
        params: React.PropTypes.object
    },

    getKeyword: function() {
        return this.props.params.searchKeyword;
    },
    getQuery: function() {
      return this.props.location.query.query;
    },

    componentDidMount: function() {
       var query = this.getQuery();
       var query = this.getKeyword();
        if (query) {
            this.props.dispatch(fetchSearchResults(query))
        }
    },

    componentDidUpdate : function (prevProps){
        if (prevProps.params.searchKeyword != this.props.params.searchKeyword) {
            var query = this.getKeyword();
            if (query) {
                this.props.dispatch(fetchSearchResults(query));
            }
        }
    },

    render: function() {
        let {isLoading, queryResults} = this.props;

        console.log("query results", queryResults);
        return (
            <div className="flex-wrapper page-search-results">
            <Header />
            <div className="search-results flex-wrapper">
            <div className='sec-nav-bar'>
          <div className='inner'>
            <ul className='action-menu'>
              <li>
                <a href='#/explore' className='btn-back'>Back to list exploration</a>
              </li>
            </ul>
          </div>
          </div>
            <h1>Search Results:</h1>
                {queryResults && isLoading ? (
                    <div className='inner prose'>
                        {queryResults.investors.length>0 ? (
                        <InvestorResults
                            investors={queryResults.investors}
                        />): null }
                        {queryResults.companies.length>0 ? (
                        <CompanyResults
                            companies={queryResults.companies}
                        />): null }
                        {queryResults.company_people.length>0 ? (
                        <CompanyPeopleResults
                            companyPeople={queryResults.company_people}
                        />): null }
                        {queryResults.investor_people.length>0 ? (
                        <InvestorPeopleResults
                            investorPeople={queryResults.investor_people}
                        />): null }

                        {(queryResults.investors.length+queryResults.company_people.length+queryResults.companies.length+queryResults.investor_people.length)==0 ? (
                        <h2>No Results Found</h2>
                        ): null }

                    </div>
                ) : (
                    <div className='inner prose'>
                        <p>Data is isLoading</p>
                    </div>
                )}
                <SearchBar />
            </div>
            </div>
        )
    }
});

function selector(state) {
    return {
        isLoading: state.search.fetching,
        queryResults: state.search.data
    }
}

module.exports = connect(selector)(Search)

//module.exports = Search;
