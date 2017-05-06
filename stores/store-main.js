import Reflux from 'reflux';
import _ from 'lodash';

import investors from '../../../../investors';
import companies from '../../../../companies';
import investments from '../../../../investments_valid';

var statusStore = Reflux.createStore({
  storage: {
    bootstrapping: true,
    investmentData: {}
  },

  init: function () {
    setTimeout(function () {
      this.storage.bootstrapping = false;


console.time('topInvestorsId');
      // Get the top investors.
      var topInvestorsId = _.chain(investments)
        .groupBy('investor')
        .values()
        .map((o) => _.reduce(o, (result, obj, key) => {
          if (result === null) {
            return obj;
          }

          result.size += obj.size;
          // result.date = result.date < obj.date ? obj.date : result.date;

          return result;
        }, null))
        .sortBy('size')
        .tap(function (arr) {
          arr.reverse();
        })
        .take(20)
        .pluck('investor_id')
        .value();

      console.log('topInvestorsId', topInvestorsId);
console.timeEnd('topInvestorsId');

console.time('investmentsByTopInvestor');
      var investmentsByTopInvestor = _.chain(investments)
        .filter((o) => _.includes(topInvestorsId, o.investor_id))
        .groupBy((o) => o.investor + o.company)
        .values()
        .map((o) => _.reduce(o, (result, obj, key) => {
          if (result === null) {
            return obj;
          }

          result.size += obj.size;
          // result.date = result.date < obj.date ? obj.date : result.date;

          return result;
        }, null))
        .groupBy('investor')
        .values()
        .map((o) => {
          return _.chain(o)
            .sortBy('size')
            .tap(function (arr) {
              arr.reverse();
            })
            .take(50)
            .value();
        })
        .flatten()
        .value();

      console.log('investmentsByTopInvestor', investmentsByTopInvestor);
console.timeEnd('investmentsByTopInvestor');

      var companiesIds = _.pluck(investmentsByTopInvestor, 'company_id');

      var theInvestors = _.filter(investors, (o) => _.includes(topInvestorsId, o.id));
      var theCompanies = _.filter(companies, (o) => _.includes(companiesIds, o.id));
      // Make ids unique.
      theInvestors = _.map(theInvestors, (o) => {
        o.size = _.chain(investmentsByTopInvestor)
          .filter('investor_id', o.id)
          .sum('size')
          .value();

        o.id = 'i' + o.id;
        return o;
      });
      theCompanies = _.map(theCompanies, (o) => {
        o.id = 'c' + o.id;
        return o;
      });

      console.log('theInvestors', theInvestors);
      console.log('theCompanies', theCompanies);

      this.storage.investmentData = {
        investors: theInvestors,
        investees: theCompanies,
        investments: investmentsByTopInvestor
      };
      this.trigger();

      return;




      console.log('investmentsTop', investmentsTop);
      console.log('investorsTop', investorsTop);
      console.log('companiesTop', companies);


      console.time('Group investments');
      // Group by investor-investee.
      var g = _.groupBy(investmentsTop, (o) => o.investor + o.company);
      // Convert back to array.
      g = _.values(g);
      // Reduce adding up the amount and storing the latest date.
      var inv = g.map((o) => _.reduce(o, (result, obj, key) => {
        if (result === null) {
          return obj;
        }

        result.size += obj.size;
        // result.date = result.date < obj.date ? obj.date : result.date;

        return result;
      }, null));

      console.log('inv', inv);

      console.timeEnd('Group investments');

      this.storage.investmentData = {
        investors: investorsTop,
        investees: companies,
        investments: inv
      };
      this.trigger();
    }.bind(this), 5);

    // vvvvv
    // Request and process data.
    // var go = function () {
    //   this.storage.bootstrapping = false;
    //   var data = generate(5, 5, 15);

    //   console.time('Group investments');
    //   // Group by investor-investee.
    //   var g = _.groupBy(data.investments, (o) => o.investor + o.investee);
    //   // Convert back to array.
    //   g = _.values(g);
    //   // Reduce adding up the amount and storing the latest date.
    //   data.investments = g.map((o) => _.reduce(o, (result, obj, key) => {
    //     if (result === null) {
    //       return obj;
    //     }

    //     result.amount += obj.amount;
    //     result.date = result.date < obj.date ? obj.date : result.date;

    //     return result;
    //   }, null));

    //   console.timeEnd('Group investments');

    //   this.storage.investmentData = data;

    //   this.trigger();
    // }.bind(this);

    // setTimeout(go, 500);
    // setTimeout(go, 5000);
    // window.go = go;
    // ^^^^^^^^^^^^^^
    // ^^^^^^^^^^^^^^
  },

  isBootstrapping: function () {
    return this.storage.bootstrapping;
  }
});

module.exports = statusStore;



// Temporary
function generate (investorsNUM, investeesNUM, investmentsNUM) {
  var continents = ['Africa', 'Asia', 'America', 'Oceania', 'Europa'];
  var sector = ['sector1', 'sector2', 'sector3', 'sector4', 'sector5'];
  var subsector = ['subsector1', 'subsector2', 'subsector3', 'subsector4', 'subsector5'];

  var getRandomDate = function () {
    return _.random(2010, 2014) + '-' + _.random(1, 12) + '-' + _.random(1, 28);
  };
  console.time('Generate Data');
  var investors = [];
  var investees = [];
  var investments = [];

  for (let i = 0; i < investorsNUM; i++) {
    var investor = {
      type: 'investor',
      id: _.uniqueId('investor_'),
      location: _.sample(continents),
      sector: _.sample(sector),
      subsector: _.sample(subsector)
    };
    investors.push(investor);
  }

  for (let i = 0; i < investeesNUM; i++) {
    var investee = {
      type: 'investee',
      id: _.uniqueId('investee_'),
      location: _.sample(continents),
      sector: _.sample(sector),
      subsector: _.sample(subsector)
    };
    investees.push(investee);
  }

  for (let i = 0; i < investmentsNUM; i++) {
    var investment = {
      investor: _.sample(investors).id,
      investee: _.sample(investees).id,
      id: _.uniqueId('investment_'),
      amount: _.random(1, 5000),
      date: getRandomDate()
    };
    investments.push(investment);
  }

  var data = {
    investors,
    investees,
    investments
  };
  console.timeEnd('Generate Data');

  return data;
}
