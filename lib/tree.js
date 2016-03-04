var events = require('./events');


var TreeNode = function(data) {
  var self = this;
  var children = [];
  var emitter = events.createEventEmitter();

  this.getData = function() {
    return data;
  };

  this.on = function(eventName, callback) {
    this.addEventListener(eventName, callback);
  };

  this.addEventListener = function(eventName, callback) {
    emitter.addEventListener(eventName, callback);
  };

  this.removeEventListener = function(eventName, callback) {
    emitter.removeEventListener(eventName, callback);
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

  this.preOrderIterate = function(callback) {
    callback(self);
    children.forEach(function(child) {
      child.preOrderIterate(callback);
    });
  };
 
  this.postOrderIterate = function(callback) {
    children.forEach(function(child) {
      child.postOrderIterate(callback);
    });
    callback(self);
  };
 
  this.size = function() {
    return children.length;
  };
  
  this.isEmpty = function() {
    return children.length === 0;
  };

  this.clear = function() {
    this.children.forEach(function(child) {
      child.clear();
      emitter.emit('remove', {parent:self, child: child});
    });
    children = [];
  };
};

module.exports.createTreeNode = function(data) {
  return new TreeNode(data);
};




var Tree = function() {
  var emitter = events.createEventEmitter();
  var self = this;

  this.on = function(eventName, callback) {
    emitter.addEventListener(eventName, callback);
  };
 
  this.addSubTree = function(parent, child) {
    emitter.emit('add', child);
    child.getChildren().forEach(function(subChild) {
      self.addSubTree(child, subChild);
    });
  };

  this.removeSubTree = function(parent, child) {
    child.getChildren().forEach(function(subChild) {
      self.removeSubTree(child, subChild);
    });
    emitter.emit('remove', child);
  };
};

module.exports.createTree = function() {
  return new Tree();
};




