import React from 'react';

import Link from 'react-router';

var InvestorResults = React.createClass({
    render: function(){
        let investors = this.props.investors;

        var investorResultNodes = investors.map(function(investor) {
            console.log("investor", investor);
            let investor_url = `#/investor/${investor.id}`;

            return( <div>
                 <a href={investor_url}>{investor.name}</a>
                 <a href={investor.url} target="_blank">External site</a>
            </div>)

        });

        return (
        <div className="investors">
            <h2> Investors</h2>
            {investorResultNodes}
        </div>)
    }
});

module.exports = InvestorResults


//(
//    <div>
//        {this.props.investors[0].name}
//    </div>
//)
