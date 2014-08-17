angular.module('seo', ['notifications', 'config', 'ui.bootstrap.modal'])
    .directive('seoSupport', ['$modal', 'i18nMessageReader', '$location', 'topicRegistry', 'config', seoSupportDirectiveFactory]);

function seoSupportDirectiveFactory($modal, i18nMessageReader, $location, topicRegistry, config) {
    return {
        restrict: 'C',
        link: function ($scope) {
            $scope.seo = {};

            topicRegistry.subscribe('config.initialized', function () {
                $scope.namespace = config.namespace;
            });

            topicRegistry.subscribe('i18n.locale', function (locale) {
                $scope.seo = {};
                $scope.locale = locale;

                getTranslation({
                    id: 'defaultTitle',
                    locale: locale,
                    code: 'seo.title.default',
                    namespace: $scope.namespace,
                    fallback: $scope.namespace
                });
            });

            function getUnlocalizedPath () {
                return $location.path().replace('/' + $scope.locale, '');
            }

            function isUnknown(translation, code) {
                return translation == '???' + code + '???';
            }

            function getTranslation (ctx) {
                i18nMessageReader(ctx, function (translation) {
                    if (isUnknown(translation, ctx.code) || translation == '') $scope.seo[ctx.id] = ctx.fallback;
                    else $scope.seo[ctx.id] =  translation;
                }, function () {
                    $scope.seo[ctx.id] = ctx.fallback;
                });
            }

            $scope.openSEOModal = function () {
                var componentsDir = config.componentsDir || 'bower_components';
                var styling = config.styling ? config.styling + '/' : '';

                var modalInstance = $modal.open({
                    templateUrl: componentsDir + '/binarta.seo.angular/template/' + styling + 'seo-modal.html',
                    controller: SEOModalInstanceCtrl,
                    scope: $scope,
                    backdrop: 'static'
                });

                modalInstance.result.then(function (input) {
                    if (input.title == '') input.title = input.defaultTitle;
                    $scope.seo = input;
                });
            };

            function getTitleTranslation () {
                getTranslation({
                    id: 'title',
                    locale: $scope.locale,
                    code: getUnlocalizedPath() + '.seo.title',
                    namespace: $scope.namespace,
                    fallback: $scope.seo.defaultTitle
                });
            }

            $scope.$on('$routeChangeSuccess', function () {
                if ($scope.seo.defaultTitle) getTitleTranslation();

                getTranslation({
                    id: 'description',
                    locale: $scope.locale,
                    code: getUnlocalizedPath() + '.seo.description',
                    namespace: $scope.namespace,
                    fallback: ''
                });
            });

            $scope.$watch('seo.defaultTitle', function (newValue) {
                if (newValue && !$scope.seo.title) getTitleTranslation();
            });
        }
    }
}

function SEOModalInstanceCtrl($scope, $modalInstance, i18nMessageWriter, usecaseAdapterFactory, $location) {
    $scope.seo.input = angular.copy($scope.seo);

    if($scope.seo.input.title == $scope.seo.input.defaultTitle) {
        $scope.seo.input.title = '';
    }

    $scope.close = function () {
        $modalInstance.dismiss();
    };

    $scope.save = function () {
        function getUnlocalizedPath () {
            return $location.path().replace('/' + $scope.locale, '');
        }

        i18nMessageWriter({
            id: 'defaultTitle',
            key: 'seo.title.default',
            message: $scope.seo.input.defaultTitle,
            namespace: $scope.namespace
        }, usecaseAdapterFactory($scope));

        if($scope.seo.input.title != $scope.seo.input.defaultTitle) {
            i18nMessageWriter({
                id: 'title',
                key: getUnlocalizedPath() + '.seo.title',
                message: $scope.seo.input.title,
                namespace: $scope.namespace
            }, usecaseAdapterFactory($scope));
        }

        i18nMessageWriter({
            id: 'description',
            key: getUnlocalizedPath() + '.seo.description',
            message: $scope.seo.input.description,
            namespace: $scope.namespace
        }, usecaseAdapterFactory($scope));

        $modalInstance.close($scope.seo.input);
    }
}