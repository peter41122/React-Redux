'use strict';
import _ from 'lodash';

var NlFormController = function NlFormController (sentence) {
  let _nlsentence = sentence;
  let _nlfields = [];

  this.getSentence = function () {
    return _nlsentence;
  };

  this.setSentence = function (sentence) {
    _nlsentence = sentence;
    return this;
  };

  this.addField = function (fieldSettings) {
    _nlfields.push(fieldSettings);
    return this;
  };

  this.setFields = function (fieldsSettings) {
    _nlfields = fieldsSettings;
    return this;
  };

  this.getFields = function () {
    return _nlfields;
  };

  this.setActive = function (fieldname, activeOpt) {
    _.find(_nlfields, {id: fieldname}).active = activeOpt;
    return this;
  };
};

module.exports = NlFormController;
