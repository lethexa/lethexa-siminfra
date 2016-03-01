var sim = require('./lib/simexec');
var model = require('./lib/testmodel');

var simExec = new sim.SimExecution();

var model1 = new model.TestModel(simExec, 'Model1');
var model2 = new model.TestModel(simExec, 'Model2');
var model3 = new model.TestModel(simExec, 'Model3');

setTimeout( function() {
  simExec.terminate();
}, 5000);

simExec.start();


