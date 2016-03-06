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




describe('Scenario', function () {
  describe('when a model is registered in scenario', function () {
    it('should call init', function () {
      var modelTree = new TestModel();	
      var scenario = new sim.Scenario();
      scenario.setModelTree(modelTree);
      scenario.doPendingInits();

      assert.equal(true, modelTree.initCalled);
    });
  });

  describe('when a model is unregistered from scenario', function () {
    it('should call shutdown', function () {
      var modelTree = new TestModel();	
      var scenario = new sim.Scenario();
      scenario.setModelTree(modelTree);
      scenario.doPendingInits();
      scenario.setModelTree(undefined);
      scenario.doPendingShutdowns();

      assert.equal(true, modelTree.shutdownCalled);
    });
  });

  describe('when a model is registered to a parent in scenario', function () {
    it('should call init when added', function () {
      var modelTree = new TestModel();	
      var newModel = new TestModel();
      var scenario = new sim.Scenario();
      scenario.setModelTree(modelTree);
      scenario.doPendingInits();
      scenario.addModel(modelTree, newModel);
      scenario.doPendingInits();

      assert.equal(true, newModel.initCalled);
    });

    it('should call shutdown when removed', function () {
      var modelTree = new TestModel();	
      var newModel = new TestModel();
      var scenario = new sim.Scenario();
      modelTree.addChild(newModel);
      scenario.setModelTree(modelTree);
      scenario.doPendingShutdowns();
      scenario.removeModel(modelTree, newModel);
      scenario.doPendingShutdowns();

      assert.equal(true, newModel.shutdownCalled);
    });
  });

  describe('when a model is registered in scenario', function () {
    it('an added-event is thrown', function () {
      var addedCalled = false;
      var modelTree = new TestModel();	
      var scenario = new sim.Scenario();

      scenario.on('add', function(model) {
        addedCalled = true;
      });
      scenario.setModelTree(modelTree);

      assert.equal(true, addedCalled);
    });
  });
});


