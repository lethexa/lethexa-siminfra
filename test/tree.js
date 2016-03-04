var assert = require('assert');
var tree = require((process.env.APP_DIR_FOR_CODE_COVERAGE || '../lib/') + 'tree.js');


describe('TreeNode', function () {
  describe('when a treenode is created as child', function () {
    it('one add-event is fired', function () {
      var eventsGenerated = 0;
      var root = tree.createTreeNode('root');
      root.addEventListener('add', function(data) {
        eventsGenerated += 1;
      });
      var child = root.createChild('child');

      assert.equal(1, eventsGenerated);
    });
  });

  describe('when a treenode is removed from parent', function () {
    it('one remove-event is fired', function () {
      var eventsGenerated = 0;
      var root = tree.createTreeNode('root');
      root.addEventListener('remove', function(data) {
        eventsGenerated += 1;
      });
      var child = root.createChild('child');
      root.remove(child);

      assert.equal(1, eventsGenerated);
    });
  });

  describe('when a treenode is iterated preorder', function () {
    it('the parent is called first then the child', function () {
      var root = tree.createTreeNode('root');
      var child = root.createChild('child');
      var result = [];
      root.preOrderIterate(function(node) {
        result.push(node);
      });      

      assert.equal(root, result[0]);
      assert.equal(child, result[1]);
    });
  });

  describe('when a treenode is iterated postorder', function () {
    it('the child is called first then the parent', function () {
      var root = tree.createTreeNode('root');
      var child = root.createChild('child');
      var result = [];
      root.postOrderIterate(function(node) {
        result.push(node);
      });      

      assert.equal(child, result[0]);
      assert.equal(root, result[1]);
    });
  });

});





describe('Tree', function () {
  var TestNode = function(name, children) {
    this.name = name;
    this.getChildren = function() {
      return children;
    };
  };

  describe('when child is created in tree', function () {
    it('a sequece of nodes is added', function () {
      var node3 = new TestNode('N3', []);
      var node2 = new TestNode('N2', [node3]);
      var node1 = new TestNode('N1', [node2]);
      var result = [];
      var theTree = tree.createTree();
      theTree.on('add', function(node) {
        result.push(node);
      });
      theTree.addSubTree(node1,node2);

      assert.equal(node2, result[0]);
      assert.equal(node3, result[1]);
    });
  });

  describe('when child is removed from tree', function () {
    it('a sequence of nodes is removed', function () {
      var node3 = new TestNode('N3', []);
      var node2 = new TestNode('N2', [node3]);
      var node1 = new TestNode('N1', [node2]);
      var result = [];
      var theTree = tree.createTree();
      theTree.on('remove', function(node) {
        result.push(node);
      });
      theTree.removeSubTree(node1,node2);

      assert.equal(node3, result[0]);
      assert.equal(node2, result[1]);
    });
  });

});


