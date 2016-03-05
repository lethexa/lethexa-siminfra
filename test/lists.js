var assert = require('assert');
var lists = require((process.env.APP_DIR_FOR_CODE_COVERAGE || '../lib/') + 'lists.js');


describe('Stack', function () {
  var TestItem = function(name) {
    this.name = name;
  };

  describe('when children are created in the tree', function () {
    it('a sequence of nodes is added', function () {
      var item3 = new TestItem('N3');
      var item2 = new TestItem('N2');
      var item1 = new TestItem('N1');
      var theStack = lists.createStack();
      
      theStack.push(item1);
      theStack.push(item2);
      theStack.push(item3);

      assert.equal(item3, theStack.pop());
      assert.equal(item2, theStack.pop());
      assert.equal(item1, theStack.pop());
    });
  });

});


