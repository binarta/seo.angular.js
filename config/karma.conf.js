basePath = '../';

files = [
    JASMINE,
    JASMINE_ADAPTER,
    'bower_components/angular/angular.js',
    'bower_components/angular-mocks/angular-mocks.js',
    'bower_components/thk-notifications-mock/src/notifications.mock.js',
    'bower_components/binarta.config.angular/src/config.js',
    'bower_components/angular-bootstrap/ui-bootstrap.js',
    'src/**/*.js',
    'test/**/*.js'
];

autoWatch = true;

browsers = ['PhantomJS'];

junitReporter = {
    outputFile: 'test_out/unit.xml',
    suite: 'unit'
};
