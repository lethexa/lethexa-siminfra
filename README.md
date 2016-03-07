lethexa-siminfra
----------------

Provides a simulation infrastructure for simulation-models.

Installation
------------

	npm install
	bower install

Example
-------

	npm start

Usage
-----

	var sim = require('lethexa-siminfra');

	var scnDef = {
		name: 'Scenario',
		models: [{
			name: 'test1',
			type: 'TestModel',
			tickRate: 1.5
		}, {
			name: 'test2',
			type: 'TestModel',
			tickRate: 2.3
		}, {
			name: 'test3',
			type: 'TestModel',
			tickRate: 1.0
		}]
	};

	
	var modelFactory = new sim.ModelFactory();
	modelFactory.registerCreator('TestModel', function(objDef) {
		return new sim.TestModel(objDef);
	});

	var scenario = new sim.Scenario();
	scenario.setModelTree(modelFactory.createModelTreeFrom(scnDef));

	var exec = new sim.Executor(scenario);
	exec.on('timeChanging', function(time) {
  		console.log('time: ', time.absolute, time.delta);
	});

	exec.run();

	setTimeout(function() {
		exec.terminate();
	}, 10000);


License
-------

This library is published under MIT license.
