
/* global exports */

(function (exports) {
  'use strict';

  var ModelList = function() {
    var models = [];

    this.addModel = function(model) {
      var index = models.indexOf(model);
      if(index >= 0)
        return;
      models.push(model);
    };

    this.removeModel = function(model) {
      var index = models.indexOf(model);
      if(index < 0)
        return;
      models.splice(index, 1);
    };

    this.forEach = function(callback) {
      return models.forEach(callback);
    };

    this.length = function() {
      return models.length;
    };
  
    this.isEmpty = function() {
      return models.length === 0;
    };
  };





  module.exports.SimExecution = function() {
    var requestList = new ModelList();
    var activeRequestors;
    var timeNow = 0.0;
    var timeStep = 1.0;
    var terminated = false;

    this.start = function() {
      terminated = false;
      doGrantNextStep();
    }; 

    this.terminate = function() {
      terminated = true;
    };

    this.timeAdvanceRequest = function(model) {
      requestList.addModel(model);
    };

    var doGrantNextStep = function() {
      activeRequestors = requestList;
      requestList = new ModelList();
      activeRequestors.forEach(function(model) {
        model.timeAdvanceGrant(timeNow, timeStep);
      });
    };

    this.timeAdvanced = function(model) {
      activeRequestors.removeModel(model);
      if(activeRequestors.isEmpty() && !terminated) {
        timeNow += timeStep;
        doGrantNextStep(timeStep);
      }    
    }; 
  };

})(typeof exports === 'undefined' ? this.simexec = {} : exports);

