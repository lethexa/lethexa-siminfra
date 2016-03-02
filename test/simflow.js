var assert = require('assert');
var sim = require((process.env.APP_DIR_FOR_CODE_COVERAGE || '../lib/') + 'scenario.js');


var scnDef = {
  models: []
};

describe('SimFlow', function () {
  describe('when a model is registered in scenario', function () {
    it('simflow should call init', function () {
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
      var simFlow = new sim.SimFlow(scenario);
      scenario.addModel(model);

      simFlow.start();
      simFlow.tickNext();

      assert.equal(true, initCalled);
    });
  });

  describe('when a model is unregistered from scenario', function () {
    it('simflow should call shutdown', function () {
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
      var simFlow = new sim.SimFlow(scenario);

      scenario.addModel(model);
      simFlow.start();
      simFlow.tickNext();
      scenario.removeModel(model);
      simFlow.tickNext();

      assert.equal(true, shutdownCalled);
    });
  });

  describe('when a simflow is terminated', function () {
    it('should call shutdown on models', function () {
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
      var simFlow = new sim.SimFlow(scenario);

      scenario.addModel(model);
      simFlow.start();
      simFlow.tickNext();
      simFlow.terminate();
      simFlow.tickNext();

      assert.equal(true, shutdownCalled);
    });
  });

  describe('when a simflow is terminated', function () {
    it('should return delta time on next tick', function () {
      var objectFactory = new sim.ObjectFactory();
      var scenarioFactory = new sim.ScenarioFactory(objectFactory);
      var scenario = scenarioFactory.createScenario(scnDef);
      var simFlow = new sim.SimFlow(scenario);

      simFlow.start();
      simFlow.tickNext();
      var dt = simFlow.tickNext();

      assert.equal(1.0, dt);
    });
  });

  describe('when a simflow is terminated', function () {
    it('should return undefined on last tick', function () {
      var objectFactory = new sim.ObjectFactory();
      var scenarioFactory = new sim.ScenarioFactory(objectFactory);
      var scenario = scenarioFactory.createScenario(scnDef);
      var simFlow = new sim.SimFlow(scenario);

      simFlow.start();
      simFlow.tickNext();
      simFlow.terminate();
      var dt = simFlow.tickNext();

      assert.equal(undefined, dt);
    });
  });
});


