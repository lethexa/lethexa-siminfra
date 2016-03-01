var lists = require('./lists');
var events = require('./events');
var sched = require('lethexa-scheduler');


var Model = function(objDef) {
  var eventName = objDef.name + '-event';
  var api;

  var tick = function() {
    console.log(objDef.name, eventName, 'tick');
    api.evtbus.queueEvent(eventName, 1.5, '');
  };

  this.init = function(simapi) {
    api = simapi;
    console.log('init', objDef.name);
    api.evtbus.register(eventName, tick);
    api.evtbus.queueEvent(eventName, 1.5, '');
  };

  this.shutdown = function(simapi) {
    api.evtbus.unregister(eventName, tick);
    console.log('shutdown', objDef.name);
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
  var modelList = lists.createSet();

  this.addModel = function(model) {
    modelList.add(model);    
  };

  this.removeModel = function(model) {
    modelList.remove(model);    
  };

  this.init = function(api) {
    modelList.forEach(function(model) {
      model.init(api);
    });
  }; 

  this.shutdown = function(api) {
    modelList.forEach(function(model) {
      model.shutdown(api);
    });
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
    scnDef.models.forEach(function(simObj) {
      var model = objFactory.createObjectFrom(simObj);
      scenario.addModel(model);
    });
    return scenario;
  };
};




var FrameTask = function(scheduler) {
  var dt = 1.0;
  var tick = function() {
    scheduler.schedule(dt, {}, tick);
    console.log('frame');
  };
  scheduler.schedule(dt, {}, tick);
};



module.exports.Executor = function(scenario) {
  var scheduler = sched.createScheduler();
  var terminated;
  var api = {
    sched: scheduler,
    evtbus: events.createMulticastContainer(scheduler)
  };
 
  var tick = function() {
    if(!terminated) {  
      scheduler.tickNext();
      setTimeout(tick, scheduler.timeTillNext() * 1000.0);
    }
    else {
      scenario.shutdown(api);
    }
  };

  this.run = function() {
    terminated = false;
    var frameTask = new FrameTask(scheduler);
    scenario.init(api);
    setTimeout(tick, scheduler.timeTillNext() * 1000.0);
  };

  this.terminate = function() {
    terminated = true;
  };
};

