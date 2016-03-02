var assert = require('assert');
var sim = require((process.env.APP_DIR_FOR_CODE_COVERAGE || '../lib/') + 'scenario.js');


var scnDef = {
  models: []
};

describe('scenario', function () {
  describe('when a model is registered in scenario', function () {
    it('should call init', function () {
      var initCalled = false;	
      var model = {
        init: function(api) {
          initCalled = true;
        },
        shutdown: function(api) {
        }
      }; 
      var objectFactory = new sim.ObjectFactory();
      var scenarioFactory = new sim.ScenarioFactory(objectFactory);
      var scenario = scenarioFactory.createScenario(scnDef);
      scenario.addModel(model);
      scenario.doPendingInits();

      assert.equal(true, initCalled);
    });
  });

  describe('when a model is unregistered from scenario', function () {
    it('should call shutdown', function () {
      var shutdownCalled = false;	
      var model = {
        init: function(api) {
        },
        shutdown: function(api) {
          shutdownCalled = true;
        }
      }; 
      var objectFactory = new sim.ObjectFactory();
      var scenarioFactory = new sim.ScenarioFactory(objectFactory);
      var scenario = scenarioFactory.createScenario(scnDef);
      scenario.addModel(model);
      scenario.doPendingInits();
      scenario.removeModel(model);
      scenario.doPendingShutdowns();

      assert.equal(true, shutdownCalled);
    });
  });
});


