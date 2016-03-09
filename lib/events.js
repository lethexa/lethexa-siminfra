var adt = require('lethexa-adt');



var EventDispatcher = function() {
  var callbackSet = adt.makeSet();
 
  this.fireEvent = function(data) {
    callbackSet.forEach(function(callback) {
      callback(data);
    });
  };

  this.on = function(callback) {
    this.addEventListener(callback);
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
    this.fireEvent(data);
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
  var callbackSet = adt.makeSet();
 
  this.fireEvent = function(data) {
    callbackSet.forEach(function(callback) {
      callback(data);
    });
  };

  this.on = function(callback) {
    this.addEventListener(callback);
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

  this.queueEvent = function(dt, data) {
    scheduler.schedule(dt, data, this.fireEvent);
  };
};



var MulticastContainer = function(scheduler) {
  var multicasterMap = {};

  this.on = function(eventName, callback) {
    this.addEventListener(eventName, callback);
  };

  this.addEventListener = function(eventName, callback) {
    if(multicasterMap[eventName] === undefined) {
      multicasterMap[eventName] = new EventMulticaster(scheduler); 
    }
    multicasterMap[eventName].addEventListener(callback);
  };
 
  this.removeEventListener = function(eventName, callback) {
    if(multicasterMap[eventName] !== undefined) {
      multicasterMap[eventName].removeEventListener(callback);
      if(multicasterMap[eventName].isEmpty()) {
        multicasterMap[eventName] = undefined;
      }
    }
  };

  this.fireEvent = function(eventName, data) {
    var multicaster = multicasterMap[eventName];
    if(multicaster !== undefined) {
      multicaster.fireEvent(data);
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



