module.exports = function(config) {
    config.set({
        basePath:'.',
        frameworks:['jasmine'],
        files:[
            {pattern:'bower_components/angular/angular.js'},
            {pattern:'bower_components/angular-mocks/angular-mocks.js'},
            {pattern:'bower_components/thk-notifications-mock/src/notifications.mock.js'},
            {pattern:'bower_components/binarta.config.angular/src/config.js'},
            {pattern:'bower_components/angular-bootstrap/ui-bootstrap.js'},
            {pattern:'src/**/*.js'},
            {pattern:'test/**/*.js'}
        ],
        browsers:['PhantomJS']
    });
};