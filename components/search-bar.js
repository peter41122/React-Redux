import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { pushPath } from 'redux-simple-router';

//import { requestSearch } from '../actions/action-creators';

var SearchBar = React.createClass({
    propTypes: {
        dispatch: React.PropTypes.func,
        query: React.PropTypes.object
    },

    query: null,

    makeQuery: function(e) {
        var q = e.target.value;
        q=String(q).replace(/^\s+|\s+$/g, ''); //replace trailing spaces just in case
        this.query = q.split(" ").join("+");
    },

    requestSearchHandler: function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.props.dispatch(pushPath(`search/${this.query}`));
    },

    render: function() {

        return (
            <div id="search">
                <form onSubmit={this.requestSearchHandler}>
                <input type="text"
                       onChange={this.makeQuery}
                       placeholder="Search..."
                />
                <button type='submit' onClick={this.requestSearchHandler} onSubmit={this.requestSearchHandler}>Go!</button>
                </form>
            </div>
        )
    }
});

function selector (state) {
    return {
        query: state.search.query
    };
}

module.exports = connect(selector)(SearchBar);
