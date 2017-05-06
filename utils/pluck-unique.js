import _ from 'lodash';

module.exports = function pluckUnique (arr, key) {
  let res = {};
  _.forEach(arr, o => {
    if (o[key]) {
      res[o[key]] = o[key];
    }
  });
  return _.values(res);
};
