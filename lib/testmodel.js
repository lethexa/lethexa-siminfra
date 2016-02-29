module.exports.TestModel = function(simexec, name) {
  var self = this;
  simexec.timeAdvanceRequest(self);

  this.timeAdvanceGrant = function(timeNow, timeStep) {
    setTimeout(function() {
      console.log('simulating model', name, timeNow, timeStep);
      simexec.timeAdvanceRequest(self);
      simexec.timeAdvanced(self); 
   }, 1000);
  };

};
