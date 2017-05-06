import React from 'react';
import { Link } from 'react-router';

var CompanyPeopleResults = React.createClass({
    render: function(){
        let people = this.props.companyPeople.slice(0,10);

        if (!people) {
            return;
        }

        var peopleResultNodes = people.map(function(person) {
            //let company_url = `/#/company/${person.company_id}`;
            //let name = person.name;

            return( <div>
                <span className="name">{person.name}</span>
                <Link to={`/company/${person.company_id}`}>{person.company_name}</Link>
            </div>)

        });

        return (
            <div className="company-people">
                <h2> Company People</h2>
                {peopleResultNodes}
            </div>)
    }
});

module.exports = CompanyPeopleResults;
