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

});


