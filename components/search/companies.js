import React from 'react';
import { Link } from 'react-router';

var CompanyResults = React.createClass({
    render: function(){
        let companies = this.props.companies;

        if (!companies) {
            return;
        }

        var companyResultNodes = companies.map(function(company) {
            console.log("company", company);
            let company_url = `#/company/${company.id}`;

            return( <div>
                <a href={company_url}>{company.name}</a>
                <a href={company.url} target="_blank">External site</a>
            </div>)

        });

        return (
            <div className="investors">
                <h2> Companies</h2>
                {companyResultNodes}
            </div>)
    }
});

module.exports = CompanyResults;
