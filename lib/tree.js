var events = require('./events');


var TreeNode = function(data) {
  var self = this;
  var children = [];
  var emitter = events.createEventEmitter();

  this.getData = function() {
    return data;
  };

  this.addEventListener = function(eventName, listener) {
    emitter.addEventListener(eventName, listener);
  };

  this.removeEventListener = function(eventName, listener) {
    emitter.removeEventListener(eventName, listener);
  };

  this.createChild = function(data) {
    var newTreeNode = new TreeNode(data);
    this.add( newTreeNode );
    return newTreeNode;
  };

  this.add = function(child) {
    var index = children.indexOf(child);
    if(index >= 0)
      return;
    children.push(child);
    emitter.emit('add', {parent: self, child: child});
  };
 
  this.remove = function(child) {
    var index = children.indexOf(child);
    if(index < 0)
      return;
    children.splice(index, 1);
    emitter.emit('remove', {parent: self, child: child});
  };

  this.contains = function(child) {
    return children.indexOf(child) >= 0;
  };

  this.forEachChild = function(callback) {
    return children.forEach(callback);
  };
 
  this.size = function() {
    return children.length;
  };
  
  this.isEmpty = function() {
    return children.length === 0;
  };

  this.clear = function() {
    children = [];
  };
};


module.exports.createTreeNode = function(data) {
  return new TreeNode(data);
};


