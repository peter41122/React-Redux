import _ from 'lodash';

var roundsToDisplay = ['Angel', 'Seed', 'Series A', 'Series B', 'Series C',
    'Series D', 'Series E', 'Series F', 'Series G'
];
var roundTypesToDisplay = ['Convertible Note', 'Debt Financing', 'Crowdfunding', 'Grant', 'Non-Equity', 'Post Ipo Equity', 'Private Equity', 'Secondary Market', 'Undisclosed'];

var rounds = [
  {
    key: 'angel',
    label: 'Angel'
  },
  {
    key: 'convertible_note',
    label: 'Convertible Note'
  },
  {
    key: 'debt_financing',
    label: 'Debt Financing'
  },
  {
    key: 'equity_crowdfunding',
    label: 'Crowdfunding'
  },
  {
    key: 'grant',
    label: 'Grant'
  },
  {
    key: 'non_equity_assistance',
    label: 'Non-Equity'
  },
  {
    key: 'post_ipo_equity',
    label: 'Post Ipo Equity'
  },
  {
    key: 'private_equity',
    label: 'Private Equity'
  },
  {
    key: 'secondary_market',
    label: 'Secondary Market'
  },
  {
    key: 'seed',
    label: 'Seed'
  },
  {
    key: 'undisclosed',
    label: 'Undisclosed'
  },
  {
    key: 'venture',
    label: 'Venture'
  },
  {
    key: null,
    label: 'null'
  },
  {
    key: "Series A",
    label: 'Series A'
  },
  {
    key: "H",
    label: 'H'
  },
  {
    key: "Series B",
    label: 'Series B'
  },
  {
    key: "C",
    label: 'Series C'
  },
  {
    key: "",
    label: 'null'
  },
  {
    key: "A",
    label: 'Series A'
  },
  {
    key: "B",
    label: 'Series B'
  },
  {
    key: "Seed",
    label: 'Seed'
  },
  {
    key: "D",
    label: "Series D"
  },
  {
    key: "Award",
    label: "Award"
  },
  {
    key: "E",
    label: "Series E"
  },
  {
    key: "F",
    label: "Series F"
  },
  {
    key: "G",
    label: "Series G"
  },
  {
    key: "Angel",
    label: "Angel"
  },
  {
    key: "Venture Round",
    label: "Venture"
  },
  {
    key: "Grant",
    label: "Grant"
  }
];

var sectors = [

  {
    key: 'Food Security',
    label: 'Food Security',
    color: '#76b438', // $infograph-color-a
    foreground: '#676767' // tint($positive-base-color, 16%);
  },
  {
    key: 'Income/Productivity Growth',
    label: 'Income/Productivity Growth',
    color: '#76b438', // $infograph-color-a
    foreground: '#676767' // tint($positive-base-color, 16%);
  },
    {
        key: 'Equality and Empowerment',
        label: 'Equality and Empowerment',
        color: '#76b438', // $infograph-color-a
        foreground: '#676767' // tint($positive-base-color, 16%);
    },
    {
        key: 'Promote Fair Trade Products',
        label: 'Promote Fair Trade Products',
        color: 'purple', // $infograph-color-a
        foreground: '#676767' // tint($positive-base-color, 16%);
    },
    {
        key: 'Generate Funds for Charitable Giving',
        label: 'Generate Funds for Charitable Giving',
        color: '#76b438', // $infograph-color-a
        foreground: '#676767' // tint($positive-base-color, 16%);
    },
    {
        key: 'Community Development',
        label: 'Community Development',
        color: 'yellow', // $infograph-color-a
        foreground: '#676767' // tint($positive-base-color, 16%);
    },
    {
        key: 'Access to Education',
        label: 'Access to Education',
        color: 'cornsilk', // $infograph-color-a
        foreground: '#676767' // tint($positive-base-color, 16%);
    },
    {
        key: 'Access to Financial Services',
        label: 'Access to Financial Services',
        color: 'crimson', // $infograph-color-a
        foreground: '#676767' // tint($positive-base-color, 16%);
    },
    {
        key: 'Employment Generation',
        label: 'Employment Generation',
        color: 'darkturquoise', // $infograph-color-a
        foreground: '#676767' // tint($positive-base-color, 16%);
    },
    {
        key: 'Human Rights Protection or Expansion',
        label: 'Human Rights Protection or Expansion',
        color: 'deeppink', // $infograph-color-a
        foreground: '#676767' // tint($positive-base-color, 16%);
    },
    {
        key: 'Equality and Empowerment',
        label: 'Equality and Empowerment',
        color: 'lightblue', // $infograph-color-a
        foreground: '#676767' // tint($positive-base-color, 16%);
    },
    {
        key: 'Generate Funds for Charitable Giving',
        label: 'Generate Funds for Charitable Giving',
        color: 'gray', // $infograph-color-a
        foreground: '#676767' // tint($positive-base-color, 16%);
    },
    {
        key: 'Access to Energy',
        label: 'Access to Energy',
        color: 'hotpink', // $infograph-color-a
        foreground: '#676767' // tint($positive-base-color, 16%);
    },
    {
        key: 'Capacity-Building',
        label: 'Capacity Building',
        color: 'gold', // $infograph-color-a
        foreground: '#676767' // tint($positive-base-color, 16%);
    },
    {
        key: 'Health Improvement',
        label: 'Health Improvement',
        color: 'orange', // $infograph-color-a
        foreground: '#676767' // tint($positive-base-color, 16%);
    },
    {
        key: 'Access to Information',
        label: 'Access to Information',
        color: 'darkgreen', // $infograph-color-a
        foreground: '#676767' // tint($positive-base-color, 16%);
    },
    {
        key: 'Agricultural Productivity',
        label: 'Agricultural Productivity',
        color: 'darkseagreen', // $infograph-color-a
        foreground: '#676767' // tint($positive-base-color, 16%);
    }

  //  ,
  //{
  //  key: 'Access to Basic Services',
  //  label: 'Access to Basic Services',
  //  color: '#76b438', // $infograph-color-a
  //  foreground: '#676767' // tint($positive-base-color, 16%);
  //},
  //{
  //  key: 'Local Economy',
  //  label: 'Local Economy',
  //  color: '#FDD361', // $infograph-color-b
  //  foreground: '#676767' // tint($positive-base-color, 16%);
  //},
  //{
  //  key: 'Sustainable Consumer Products',
  //  label: 'Sustainable Consumer Products',
  //  color: '#e5a42c', // $infograph-color-c
  //  foreground: '#676767' // tint($positive-base-color, 16%);
  //},
  //{
  //  key: 'Human Rights',
  //  label: 'Human Rights',
  //  color: '#be5151', // $infograph-color-d
  //  foreground: '#676767' // tint($positive-base-color, 16%);
  //},
  //{
  //  key: 'Other',
  //  label: 'Other',
  //  color: '#8A212E', // $infograph-color-e
  //  foreground: '#bebebe'  // tint($positive-base-color, 64%);
  //}
];

var geographies = [
  {
    key: 'Americas',
    label: 'Americas',
    color: '#76b438', // $infograph-color-a
    foreground: '#676767' // tint($positive-base-color, 16%);
  },
  {
    key: 'Asia',
    label: 'Asia',
    color: '#FDD361', // $infograph-color-b
    foreground: '#676767' // tint($positive-base-color, 16%);
  },
  {
    key: 'Europe',
    label: 'Europe',
    color: '#e5a42c', // $infograph-color-c
    foreground: '#676767' // tint($positive-base-color, 16%);
  },
  {
    key: 'World',
    label: 'World',
    color: '#be5151', // $infograph-color-d
    foreground: '#676767' // tint($positive-base-color, 16%);
  },
  {
    key: 'Africa',
    label: 'Africa',
    color: '#8A212E',  // $infograph-color-e
    foreground: '#bebebe'  // tint($positive-base-color, 64%);
  },
  {
    key: 'Middle East',
    label: 'Middle East',
    color: '#5B2447',  // $infograph-color-f
    foreground: '#bebebe'  // tint($positive-base-color, 64%);
  },
  {
    key: 'Oceania',
    label: 'Oceania',
    color: '#5EB9BA',  // $infograph-color-g
    foreground: '#676767' // tint($positive-base-color, 16%);
  }
];

var defaults = [
  {
    key: 'all',
    label: 'All',
    color: '#5EB9BA',
    foreground: '#676767' // tint($positive-base-color, 16%);
  }
];

var funcs = {
  get: function (key) {
    let f = _.find(this, 'key', key);
    return f || {key: 'n/a', label: 'N/A', color: '#4A4A4A', foreground: '#676767'};
  },

  getStyle: function (key) {
    let f = this.get(key);
    return {
      backgroundColor: f.color,
      color: f.foreground
    };
  }
};

_.extend(rounds, funcs);
_.extend(sectors, funcs);
_.extend(geographies, funcs);
_.extend(defaults, funcs);

module.exports = {
  rounds,
  roundsToDisplay,
  roundTypesToDisplay,
  sectors,
  geographies,
  defaults
};
