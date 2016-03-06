var assert = require('assert');
var sim = require((process.env.APP_DIR_FOR_CODE_COVERAGE || '../lib/') + 'scenario.js');


var scnDef = {
  models: []
};


var TestModel = function() {
  sim.EmptyModel.call(this);
  this.initCalled = false;
  this.shutdownCalled = false;

  this.init = function(api) {
    this.initCalled = true;
  },

  this.shutdown = function(api) {
    this.shutdownCalled = true;
  }
};
TestModel.prototype = new sim.EmptyModel();




describe('SimFlow', function () {
  describe('when a model is registered in scenario', function () {
    it('simflow should call init', function () {
      var modelTree = new TestModel();
      var scenario = new sim.Scenario();
      var simFlow = new sim.SimFlow(scenario);
      scenario.setModelTree(modelTree);

      simFlow.start();
      simFlow.tickNext();

      assert.equal(true, modelTree.initCalled);
    });
  });

  describe('when a model is unregistered from scenario', function () {
    it('simflow should call shutdown', function () {
      var modelTree = new TestModel();
      var scenario = new sim.Scenario();
      var simFlow = new sim.SimFlow(scenario);

      scenario.addModel(undefined, modelTree);
      simFlow.start();
      simFlow.tickNext();
      scenario.removeModel(undefined, modelTree);
      simFlow.tickNext();

      assert.equal(true, modelTree.shutdownCalled);
    });
  });

  describe('when a model is registered in scenario and another is added after som ticks', function () {
    it('simflow should call init on both', function () {
      var modelTree = new TestModel();
      var newModel = new TestModel();
      var scenario = new sim.Scenario();
      var simFlow = new sim.SimFlow(scenario);
      scenario.setModelTree(modelTree);

      simFlow.start();
      simFlow.tickNext();
      simFlow.tickNext();
      scenario.addModel(modelTree, newModel);
      simFlow.tickNext();

      assert.equal(true, modelTree.initCalled);
      assert.equal(true, newModel.initCalled);
    });

    it('simflow should call shutdown on both', function () {
      var modelTree = new TestModel();
      var newModel = new TestModel();
      var scenario = new sim.Scenario();
      var simFlow = new sim.SimFlow(scenario);
      scenario.setModelTree(modelTree);

      simFlow.start();
      simFlow.tickNext();
      simFlow.tickNext();
      scenario.addModel(modelTree, newModel);
      simFlow.tickNext();
      scenario.removeModel(modelTree, newModel);
      scenario.removeModel(undefined, modelTree);
      simFlow.tickNext();

      assert.equal(true, modelTree.shutdownCalled);
      assert.equal(true, newModel.shutdownCalled);
    });

    it('simflow should call shutdown on both when terminated', function () {
      var modelTree = new TestModel();
      var newModel = new TestModel();
      var scenario = new sim.Scenario();
      var simFlow = new sim.SimFlow(scenario);
      scenario.setModelTree(modelTree);

      simFlow.start();
      simFlow.tickNext();
      simFlow.tickNext();
      scenario.addModel(modelTree, newModel);
      simFlow.tickNext();
      simFlow.terminate();
      simFlow.tickNext();

      assert.equal(true, modelTree.shutdownCalled);
      assert.equal(true, newModel.shutdownCalled);
    });
  });

  describe('when a simflow is terminated', function () {
    it('should call shutdown on models', function () {
      var modelTree = new TestModel();
      var scenario = new sim.Scenario();
      var simFlow = new sim.SimFlow(scenario);

      scenario.addModel(undefined, modelTree);
      simFlow.start();
      simFlow.tickNext();
      simFlow.terminate();
      simFlow.tickNext();

      assert.equal(true, modelTree.shutdownCalled);
    });
  });

  describe('when a simflow is ticked', function () {
    it('should return delta time on next tick', function () {
      var scenario = new sim.Scenario();
      var simFlow = new sim.SimFlow(scenario, 0.5);

      simFlow.start();
      simFlow.tickNext();
      var dt = simFlow.tickNext();

      assert.equal(0.5, dt);
    });
  });

  describe('when a simflow is terminated', function () {
    it('should return undefined on last tick', function () {
      var scenario = new sim.Scenario();
      var simFlow = new sim.SimFlow(scenario);

      simFlow.start();
      simFlow.tickNext();
      simFlow.terminate();
      var dt = simFlow.tickNext();

      assert.equal(undefined, dt);
    });
  });
});


