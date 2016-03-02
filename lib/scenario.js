var lists = require('./lists');
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
  var self = this;
  var modelList = lists.createSet();
  var toInitSet = lists.createSet();
  var toShutdownSet = lists.createSet(); 

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




var FrameTask = function(scheduler) {
  var dt = 1.0;
  var tick = function() {
    scheduler.schedule(dt, {}, tick);
    console.log(scheduler.getAbsTime(), 'frame');
  };
  scheduler.schedule(dt, {}, tick);
};



module.exports.Executor = function(scenario) {
  var scheduler = sched.createScheduler();
  var terminated;
  var api = {
    scn: scenario,
    sched: scheduler,
    evtbus: events.createMulticastContainer(scheduler)
  };
 
  var tick = function() {
    if(!terminated) {  
      scenario.doPendingShutdowns(api);
      scenario.doPendingInits(api);
      scheduler.tickNext();
      setTimeout(tick, scheduler.timeTillNext() * 1000.0);
    }
    else {
      scenario.removeAll();
      scenario.doPendingShutdowns(api);
    }
  };

  this.run = function() {
    terminated = false;
    var frameTask = new FrameTask(scheduler);
    setTimeout(tick, scheduler.timeTillNext() * 1000.0);
  };

  this.terminate = function() {
    terminated = true;
  };
};

