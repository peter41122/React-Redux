import React from 'react';
import { Link } from 'react-router';

var InvestorPeopleResults = React.createClass({
    render: function(){
        let people = this.props.investorPeople.slice(0,10);
        console.log("INVESTOR PEOPLE:", people);

        if (!people) {
            return;
        }

        var peopleResultNodes = people.map(function(person) {
            console.log("company", person);
            //let company_url = `/#/company/${person.company_id}`;
            //let name = person.name;

            return( <div>
                <span className="name">{person.name}</span>
                <Link to={`/investor/${person.investor_id}`}>{person.investor_name}</Link>
            </div>)

        });

        return (
            <div className="investor-people">
                <h2> Investor People</h2>
                {peopleResultNodes}
            </div>)
    }
});

module.exports = InvestorPeopleResults;
