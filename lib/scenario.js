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
  module.exports.EmptyModel.call(this);
  var self = this;
  var eventName = objDef.name + '-event';
  var api;


  var tick = function() {
    console.log(api.sched.getAbsTime(), objDef.name, eventName, 'tick');
    api.evtbus.queueEvent(eventName, objDef.tickRate, '');

    if(api.sched.getAbsTime() === 5) {
      var newModel = new module.exports.TestModel({
        name: 'test0004',
        tickRate: 0.5
      });
      api.scn.addModel(self, newModel);
    }
  };

  this.init = function(simapi) {
    api = simapi;
    console.log(api.sched.getAbsTime(), 'init', objDef.name);
    api.evtbus.addEventListener(eventName, tick);
    api.evtbus.queueEvent(eventName, objDef.tickRate, '');
  };

  this.shutdown = function(simapi) {
    api.evtbus.removeEventListener(eventName, tick);
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
    else
      parent.addChild(model);
    this.signalSubTreeAdded(model);
  };

  this.removeModel = function(parent, model) {
    this.signalSubTreeRemoved(model);
    if(parent === undefined)
      modelRoot = undefined;
    else
      parent.removeChild(model);
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
  var evtbus = events.createMulticastContainer(scheduler);
  var terminated;
  var api = {
    scn: scenario,
    sched: scheduler,
    evtbus: evtbus
  };
 
  this.on = function(eventName, callback) {
    evtbus.addEventListener(eventName, callback);
  };

  this.addEventListener = function(eventName, callback) {
    evtbus.addEventListener(eventName, callback);
  };
 
  this.removeEventListener = function(eventName, callback) {
    evtbus.addEventListener(eventName, callback);
  };
 

  this.start = function() {
    terminated = false;
    var frameTask = new FrameTask(scheduler, frameRate);
    var dt = scheduler.timeTillNext();
    var absTime = scheduler.getAbsTime();
    evtbus.fireEvent('timeChanging', {absolute: absTime, delta: dt});
    return dt;
  };
 
  this.tickNext = function() {
    var absTime, dt;
    if(!terminated) {  
      scenario.doPendingInits(api);
      scenario.doPendingShutdowns(api);
      scheduler.tickNext();
      dt = scheduler.timeTillNext();
      if(dt > 0.0) {
        absTime = scheduler.getAbsTime();
        evtbus.fireEvent('timeChanging', {absolute: absTime, delta: dt});
      }
      return dt;
    }
    else {
      scenario.clear();
      scenario.doPendingShutdowns(api);
      dt = scheduler.timeTillNext();
      absTime = scheduler.getAbsTime();
      evtbus.fireEvent('timeChanging', {absolute: absTime, delta: dt});
      return undefined;
    }
  };
 
  this.terminate = function() {
    terminated = true;
  };
};




module.exports.Executor = function(scenario, frameRate) {
  var simFlow = new module.exports.SimFlow(scenario, frameRate);

  this.on = function(eventName, callback) {
    simFlow.addEventListener(eventName, callback);
  };

  this.addEventListener = function(eventName, callback) {
    simFlow.addEventListener(eventName, callback);
  };
 
  this.removeEventListener = function(eventName, callback) {
    simFlow.addEventListener(eventName, callback);
  };
 
 
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

