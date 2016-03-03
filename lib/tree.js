
var TreeNode = function(data) {
  var children = [];

  this.add = function(child) {
    var index = children.indexOf(child);
    if(index >= 0)
      return;
    children.push(child);
  };
 
  this.remove = function(child) {
    var index = children.indexOf(child);
    if(index < 0)
      return;
     children.splice(index, 1);
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


