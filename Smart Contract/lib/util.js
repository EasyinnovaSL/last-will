/**
 * Created by Adrià on 03/10/2017.
 */

module.exports = {

    atMultiple: function(instances) {
        var promises = [];

        for (var key in instances){
            var instance = instances[key];
            promises.push(instance.contract.at(instance.address));
        }

        return Promise.all(promises);
    },

    deployMultiple: function(instances) {
        var promises = [];

        for (var key in instances){
            var contract = instances[key];
            promises.push(contract.deployed());
        }

        return Promise.all(promises);
    },

    parseDeployed: function(instances, deployed) {
        var i = 0;
        var newInstances = {};
        for (var key in instances){
            newInstances[key] = deployed[i];
            i++;
        }
        return newInstances;
    }

};
