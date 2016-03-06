var assert = require('assert');
var sim = require((process.env.APP_DIR_FOR_CODE_COVERAGE || '../lib/') + 'scenario.js');



var TestModel = function(name, initArray, shutdownArray) {
  sim.EmptyModel.call(this);
  this.name = name;
  initArray = initArray || [];
  shutdownArray = shutdownArray || [];

  this.initCalled = false;
  this.shutdownCalled = false;

  this.init = function(api) {
    this.initCalled = true;
    initArray.push(this);
  },

  this.shutdown = function(api) {
    this.shutdownCalled = true;
    shutdownArray.push(this);
  }
};
TestModel.prototype = new sim.EmptyModel();




describe('Scenario', function () {
  describe('when a model is registered in scenario', function () {
    it('should call init', function () {
      var modelTree = new TestModel('n1');	
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

  describe('when a modeltree is registered to a scenario', function () {
    it('should call init in right order', function () {
      var initArray = [];
      var shutdownArray = []; 
      var modelTree = new TestModel('n1', initArray, shutdownArray);	
      var newSubModel1 = new TestModel('n2', initArray, shutdownArray);
      var newSubModel2 = new TestModel('n3', initArray, shutdownArray);
      var scenario = new sim.Scenario();
      modelTree.addChild(newSubModel1);
      newSubModel1.addChild(newSubModel2);
      scenario.setModelTree(modelTree);

      scenario.doPendingInits();

      assert.equal(modelTree, initArray[0]);
      assert.equal(newSubModel1, initArray[1]);
      assert.equal(newSubModel2, initArray[2]);
    });

    it('should call shutdown in right order', function () {
      var initArray = [];
      var shutdownArray = []; 
      var modelTree = new TestModel('n1', initArray, shutdownArray);	
      var newSubModel1 = new TestModel('n2', initArray, shutdownArray);
      var newSubModel2 = new TestModel('n3', initArray, shutdownArray);
      var scenario = new sim.Scenario();
      modelTree.addChild(newSubModel1);
      newSubModel1.addChild(newSubModel2);
      scenario.setModelTree(modelTree);
      scenario.doPendingInits(); 
 
      scenario.clear();
      scenario.doPendingShutdowns();

      assert.equal(newSubModel2, shutdownArray[0]);
      assert.equal(newSubModel1, shutdownArray[1]);
      assert.equal(modelTree, shutdownArray[2]);
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


