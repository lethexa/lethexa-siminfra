var events = require('./events');


var TreeNode = function(data) {
  var self = this;
  var children = [];
  var parent;
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
    this.addChild( newTreeNode );
    return newTreeNode;
  };

  this.addChild = function(child) {
    var index = children.indexOf(child);
    if(index >= 0)
      return;
    children.push(child);
    parent = self;
    emitter.emit('add', {parent: self, child: child});
  };

  this.removeChild = function(child) {
    var index = children.indexOf(child);
    if(index < 0)
      return;
    children.splice(index, 1);
    parent = undefined;
    emitter.emit('remove', {parent: self, child: child});
  };

  this.getParent = function() {
    return parent;
  };

  this.getChildren = function() {
    return children;
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





module.exports.Node = function() {
  var parent;
  var children = [];

  this.setParent = function(p) {
    parent = p;
  };

  this.addChild = function(child) {
    var index = children.indexOf(child);
    if(index >= 0)
      return;
    children.push(child);
    child.setParent(this);
  };

  this.removeChild = function(child) {
    var index = children.indexOf(child);
    if(index < 0)
      return;
    children.splice(index, 1);
    child.setParent(undefined);
  };

  this.getChildren = function() {
    return children;
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
};



module.exports.Tree = function() {
  var emitter = events.createEventEmitter();
  var self = this;

  this.on = function(eventName, callback) {
    this.addEventListener(eventName, callback);
  };

  this.addEventListener = function(eventName, callback) {
    emitter.addEventListener(eventName, callback);
  };

  this.removeEventListener = function(eventName, callback) {
    emitter.removeEventListener(eventName, callback);
  };

  this.signalSubTreeAdded = function(child) {
    if(child === undefined)
      return;
    emitter.emit('add', child);
    child.getChildren().forEach(function(subChild) {
      self.signalSubTreeAdded(subChild);
    });
  };

  this.signalSubTreeRemoved = function(child) {
    if(child === undefined)
      return;
    child.getChildren().forEach(function(subChild) {
      self.signalSubTreeRemoved(subChild);
    });
    emitter.emit('remove', child);
  };
};

module.exports.createTree = function(root) {
  return new module.exports.Tree(root);
};




