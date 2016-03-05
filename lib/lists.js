
var Stack = function() {
  var items = [];

  this.push = function(item) {
    items.push(item);
  };
 
  this.pop = function() {
     return items.pop();
  };

  this.forEach = function(callback) {
    return items.forEach(callback);
  };
 
  this.size = function() {
    return items.length;
  };
  
  this.isEmpty = function() {
    return items.length === 0;
  };

  this.clear = function() {
    items = [];
  };
};

module.exports.createStack = function() {
  return new Stack();
};





var Set = function() {
  var models = [];

  this.add = function(model) {
    var index = models.indexOf(model);
    if(index >= 0)
      return;
    models.push(model);
  };
 
  this.remove = function(model) {
    var index = models.indexOf(model);
    if(index < 0)
      return;
     models.splice(index, 1);
  };

  this.contains = function(model) {
    return models.indexOf(model) >= 0;
  };

  this.forEach = function(callback) {
    return models.forEach(callback);
  };
 
  this.length = function() {
    return models.length;
  };
  
  this.isEmpty = function() {
    return models.length === 0;
  };

  this.clear = function() {
    models = [];
  };
};


module.exports.createModelList = function() {
  return new Set();
};

module.exports.createSubscriberList = function() {
  return new Set();
};

module.exports.createSet = function() {
  return new Set();
};

