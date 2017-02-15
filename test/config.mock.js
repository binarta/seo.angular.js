angular.module('config', [])
    .service('config', function () {
        this.namespace = 'namespace';
        this.awsPath = 'aws/path/';
    });