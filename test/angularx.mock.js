angular.module('angularx', [])
    .factory('binTruncateSpy', function () {
        return jasmine.createSpy('binTruncateSpy');
    })
    .filter('binTruncate', function (binTruncateSpy) {
        return function (value, length) {
            binTruncateSpy({value: value, length: length});
            return value;
        }
    });