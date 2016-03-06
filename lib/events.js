var lists = require('./lists');



var EventDispatcher = function() {
  var callbackSet = lists.createSet();
 
  var notifyAll = function(data) {
    callbackSet.forEach(function(callback) {
      callback(data);
    });
  };
 
  this.addEventListener = function(callback) {
    callbackSet.add(callback);
  };

  this.removeEventListener = function(callback) {
    callbackSet.remove(callback);
  };

  this.isEmpty = function() {
    return callbackSet.isEmpty();
  };

  this.dispatch = function(data) {
    notifyAll(data);
  };
};



var EventEmitter = function() {
  var dispatcherMap = {};

  this.addEventListener = function(eventName, callback) {
    if(dispatcherMap[eventName] === undefined) {
      dispatcherMap[eventName] = new EventDispatcher(); 
    }
    dispatcherMap[eventName].addEventListener(callback);
  };
 
  this.removeEventListener = function(eventName, callback) {
    if(dispatcherMap[eventName] !== undefined) {
      dispatcherMap[eventName].removeEventListener(callback);
      if(dispatcherMap[eventName].isEmpty()) {
        dispatcherMap[eventName] = undefined;
      }
    }
  };

  this.emit = function(eventName, data) {
    var dispatcher = dispatcherMap[eventName];
    if(dispatcher !== undefined) {
      dispatcher.dispatch.call(dispatcher, data);
    }
  };
};






var EventMulticaster = function(scheduler) {
  var callbackSet = lists.createSet();
 
  var notifyAll = function(data) {
    callbackSet.forEach(function(callback) {
      callback(data);
    });
  };
 
  this.register = function(callback) {
    callbackSet.add(callback);
  };

  this.unregister = function(callback) {
    callbackSet.remove(callback);
  };

  this.isEmpty = function() {
    return callbackSet.isEmpty();
  };
 
  this.queueEvent = function(dt, data) {
    scheduler.schedule(dt, data, notifyAll);
  };
};



var MulticastContainer = function(scheduler) {
  var multicasterMap = {};

  this.register = function(eventName, callback) {
    if(multicasterMap[eventName] === undefined) {
      multicasterMap[eventName] = new EventMulticaster(scheduler); 
    }
    multicasterMap[eventName].register(callback);
  };
 
  this.unregister = function(eventName, callback) {
    if(multicasterMap[eventName] !== undefined) {
      multicasterMap[eventName].unregister(callback);
      if(multicasterMap[eventName].isEmpty()) {
        multicasterMap[eventName] = undefined;
      }
    }
  };

  this.queueEvent = function(eventName, dt, data) {
    var multicaster = multicasterMap[eventName];
    if(multicaster !== undefined) {
      multicaster.queueEvent(dt, data);
    }
  };
};



module.exports.createMulticastContainer = function(scheduler) {
  return new MulticastContainer(scheduler);
};

module.exports.createEventEmitter = function() {
  return new EventEmitter();
};



