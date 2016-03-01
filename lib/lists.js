
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

  this.forEach = function(callback) {
    return models.forEach(callback);
  };
 
  this.length = function() {
    return models.length;
  };
  
  this.isEmpty = function() {
    return models.length === 0;
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

