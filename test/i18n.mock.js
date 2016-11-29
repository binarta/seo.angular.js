angular.module('i18n', [])
    .service('i18n', ['$q', function ($q) {
        this.resolveSpy = {};
        this.updateSpy = {};

        this.resolve = function (ctx) {
            var deferred = $q.defer();
            var value = this.updateSpy[ctx.code] || ctx.default;
            this.resolveSpy[ctx.code] = value;
            deferred.resolve(value);
            return deferred.promise;
        };
        this.translate = function (ctx) {
            var deferred = $q.defer();

            this.updateSpy[ctx.code] = ctx.translation;

            deferred.resolve('ok');
            return deferred.promise;
        };
    }])
    .service('i18nLocation', ['$q', function ($q) {
        this.unlocalizedPath = function () {
            var deferred = $q.defer();
            deferred.resolve('/unlocalized/path');
            return deferred.promise;
        }
    }])
    .factory('localeResolver', function () {
        return function () {
            return 'en';
        };
    });