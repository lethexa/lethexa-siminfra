var sim = require('./lib/scenario');

var scnDef = {
  models: [{
    name: 'test1'
  }, {
    name: 'test2'
  }]
};


var objectFactory = new sim.ObjectFactory();
var scenarioFactory = new sim.ScenarioFactory(objectFactory);

var scenario = scenarioFactory.createScenario(scnDef);

var exec = new sim.Executor(scenario);
exec.run();

setTimeout(function() {
  exec.terminate();
}, 5000);

