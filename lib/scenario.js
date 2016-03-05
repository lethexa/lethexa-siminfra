var lists = require('./lists');
var tree = require('./tree');
var events = require('./events');
var sched = require('lethexa-scheduler');


var Model = function(objDef) {
  var eventName = objDef.name + '-event';
  var api;

  var tick = function() {
    console.log(api.sched.getAbsTime(), objDef.name, eventName, 'tick');
    api.evtbus.queueEvent(eventName, objDef.tickRate, '');

    if(api.sched.getAbsTime() == 5)
      api.scn.addModel(new Model({
        name: 'test4',
        tickRate: 0.5
      }));
  };

  this.init = function(simapi) {
    api = simapi;
    console.log(api.sched.getAbsTime(), 'init', objDef.name);
    api.evtbus.register(eventName, tick);
    api.evtbus.queueEvent(eventName, objDef.tickRate, '');
  };

  this.shutdown = function(simapi) {
    api.evtbus.unregister(eventName, tick);
    console.log(api.sched.getAbsTime(), 'shutdown', objDef.name);
    api = undefined;
  };
};



/**
 * Class to parse template files to create a runnable 
 * object.
 * @class ObjectFactory
 * @constructor
 */
module.exports.ObjectFactory = function() {
  var type2Creator = {};

  this.registerCreator = function(objType, creatorFunc) {
    type2Creator[objType] = creatorFunc;
  };

  this.createObjectFrom = function(objDef) {
    var creatorFunc = type2Creator[objDef.type];
    if(creatorFunc === undefined)
      return new Model(objDef);
    return creatorFunc();
  };
};



var Scenario = function(scnDef) {
  var scnTree = tree.createTree();
  var modelList = lists.createSet();
  var toInitSet = lists.createSet();
  var toShutdownSet = lists.createSet(); 

  scnTree.on('add', function(child) {
    toInitSet.add(child);
  });

  scnTree.on('remove', function(child) {
    toShutdownSet.add(child);
  });

  var parseStructure = function(struct, root) {
    struct.models.forEach(function(subStruct) {
      var model = objFactory.createObjectFrom(subStruct);
      var child = root.createTreeNode(model); 
      parseStructure(subStruct, child);
    });
  };

  this.load = function(struct) {
    rootNode.clear();
    parseStructure(struct, rootNode);
  };


  this.addModel = function(model) {
    modelList.add(model);
    toShutdownSet.remove(model);
    toInitSet.add(model);    
  };

  this.removeModel = function(model) {
    modelList.remove(model);
    toInitSet.remove(model);
    toShutdownSet.add(model);    
  };

  this.doPendingInits = function(api) {
    toInitSet.forEach(function(model) {
      model.init(api);
    });
    toInitSet.clear();
  };

  this.doPendingShutdowns = function(api) {
    toShutdownSet.forEach(function(model) {
      model.shutdown(api);
    });
    toShutdownSet.clear();
  };

  this.removeAll = function() {
    toInitSet = lists.createSet();
    toShutdownSet = modelList;
    modelList = lists.createSet();
  };
};



/**
 * Class to parse template files to create a runnable 
 * scenario.
 * @class ScenarioFactory
 * @constructor
 */
module.exports.ScenarioFactory = function(objFactory) {

  /**
   * This function parses tempates as json-objects.
   */
  this.createScenario = function(scnDef) {
    var scenario = new Scenario(scnDef);
    scnDef = scnDef || {};
    if(scnDef.models === undefined)
      return scenario;
    scnDef.models.forEach(function(simObj) {
      var model = objFactory.createObjectFrom(simObj);
      scenario.addModel(model);
    });
    return scenario;
  };
};


/*
var ScenarioExecution = function(scnDef, objFactory) {
  var rootNode = tree.createTreeNode({});

  rootNode.on('add', function(child) {
    
  });

  rootNode.on('remove', function(child) {
  });

  var parseStructure = function(struct, root) {
    struct.models.forEach(function(subStruct) {
      var model = objFactory.createObjectFrom(subStruct);
      var child = root.createTreeNode(model); 
      parseStructure(subStruct, child);
    });
  };
  parseStructure(scnDef, rootNode);
};
*/



var FrameTask = function(scheduler, frameRate) {
  frameRate = frameRate || 1.0;
  var tick = function() {
    scheduler.schedule(frameRate, {}, tick);
  };
  scheduler.schedule(frameRate, {}, tick);
};



module.exports.SimFlow = function(scenario, frameRate) {
  var scheduler = sched.createScheduler();
  var terminated;
  var api = {
    scn: scenario,
    sched: scheduler,
    evtbus: events.createMulticastContainer(scheduler)
  };

  this.start = function() {
    terminated = false;
    var frameTask = new FrameTask(scheduler, frameRate);
    return scheduler.timeTillNext();
  };
 
  this.tickNext = function() {
    if(!terminated) {  
      scenario.doPendingShutdowns(api);
      scenario.doPendingInits(api);
      scheduler.tickNext();
      return scheduler.timeTillNext();
    }
    else {
      scenario.removeAll();
      scenario.doPendingShutdowns(api);
      return undefined;
    }
  };
 
  this.terminate = function() {
    terminated = true;
  };
};




module.exports.Executor = function(scenario, frameRate) {
  var simFlow = new module.exports.SimFlow(scenario, frameRate);
 
  var tick = function() {
    var dt = simFlow.tickNext();
    if(dt !== undefined) {
      setTimeout(tick, dt * 1000.0);
    }
  };

  this.run = function() {
    var dt = simFlow.start();
    setTimeout(tick, dt * 1000.0);
  };

  this.terminate = function() {
    simFlow.terminate();
  };
};

