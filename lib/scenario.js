var lists = require('./lists');
var tree = require('./tree');
var events = require('./events');
var sched = require('lethexa-scheduler');


module.exports.EmptyModel = function(objDef) {
  tree.Node.call(this);

  this.init = function(simapi) {
  };

  this.shutdown = function(simapi) {
  };
};
module.exports.EmptyModel.prototype = new tree.Node();




module.exports.TestModel = function(objDef) {
  var eventName = objDef.name + '-event';
  var api;

  module.exports.EmptyModel.call(this);

  var tick = function() {
    console.log(api.sched.getAbsTime(), objDef.name, eventName, 'tick');
    api.evtbus.queueEvent(eventName, objDef.tickRate, '');

/**
    if(api.sched.getAbsTime() == 5)
      api.scn.addModel(new Model({
        name: 'test4',
        tickRate: 0.5
      }));
*/
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
module.exports.TestModel.prototype = new module.exports.EmptyModel();



/**
 * Class to parse template files to create a runnable 
 * object.
 * @class ObjectFactory
 * @constructor
 */
module.exports.ModelFactory = function() {
  var self = this;
  var type2Creator = {};

  this.registerCreator = function(objType, creatorFunc) {
    type2Creator[objType] = creatorFunc;
  };

  var createModelFrom = function(objDef) {
    var creatorFunc = type2Creator[objDef.type];
    if(creatorFunc === undefined)
      return new module.exports.EmptyModel(objDef);
    return creatorFunc(objDef);
  };

  this.createModelTreeFrom = function(objDef) {
    objDef = objDef || {};
    var root = createModelFrom(objDef);
    if(objDef.models !== undefined) {
      objDef.models.forEach(function(subObj) {
        root.addChild(self.createModelTreeFrom(subObj));
      });
    }
    return root;
  };
};


// Lifetime-manager
module.exports.Scenario = function() {
  var modelRoot;
  var toInitSet = lists.createSet();
  var toShutdownSet = lists.createSet(); 

  tree.Tree.call(this);

  this.on('add', function(child) {
    toInitSet.add(child);
  });

  this.on('remove', function(child) {
    toShutdownSet.add(child);
  });

  this.setModelTree = function(subTree) {
    this.signalSubTreeRemoved(modelRoot);
    modelRoot = subTree;
    this.signalSubTreeAdded(modelRoot);
  };

  this.addModel = function(parent, model) {
    if(parent === undefined)
      modelRoot = model;
    this.signalSubTreeAdded(model);
  };

  this.removeModel = function(parent, model) {
    this.signalSubTreeRemoved(model);
    if(parent === undefined)
      modelRoot = undefined;
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

  this.clear = function() {
    this.removeModel(undefined, modelRoot);
  };
};
module.exports.Scenario.prototype = new tree.Tree();






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
      scenario.doPendingInits(api);
      scenario.doPendingShutdowns(api);
      scheduler.tickNext();
      return scheduler.timeTillNext();
    }
    else {
      scenario.clear();
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

