(function () {
    angular.module('seo', ['binarta-applicationjs-angular1', 'binarta-checkpointjs-angular1', 'i18n', 'config',
        'toggle.edit.mode', 'ngRoute', 'angularx'])
        .service('seoSupport', ['$location', '$q', '$document', 'i18n', 'config', 'binarta', SeoSupportService])
        .directive('seoSupport', ['editModeRenderer', 'seoSupport', 'binarta', seoSupportDirectiveFactory])
        .directive('seoTitle', ['seoSupport', SeoTitleDirective])
        .directive('seoDescription', ['$filter', 'seoSupport', SeoDescriptionDirective])
        .directive('seoImage', ['seoSupport', SeoImageDirective])
        .run(['seoSupport', '$rootScope', function (seoSupport, $rootScope) {
            $rootScope.$on('$routeChangeStart', function () {
                seoSupport.resolve();
            });
        }]);

    function SeoSupportService($location, $q, $document, i18n, config, binarta) {
        var self = this;
        var head = $document.find('head');

        this.seo = {};

        this.getSEOValues = function (args) {
            binarta.schedule(function () {
                var path = binarta.application.unlocalizedPath();
                $q.all([
                    i18n.resolve({code: 'seo.site.name', default: getNamespace()}),
                    i18n.resolve({code: 'seo.title.default', default: ''}),
                    i18n.resolve({code: path + '.seo.title', default: ''}),
                    i18n.resolve({code: path + '.seo.description', default: ''})
                ]).then(function (result) {
                    self.seo = {
                        siteName: result[0].trim(),
                        defaultTitle: result[1].trim(),
                        title: result[2].trim(),
                        description: result[3].trim()
                    };
                    if (args && args.success) args.success(self.seo);
                });
            });
        };

        this.update = function (args) {
            $q.all([
                i18n.translate({code: 'seo.site.name', translation: args.siteName}),
                i18n.translate({code: 'seo.title.default', translation: args.defaultTitle}),
                i18n.translate({code: args.pageCode + '.seo.title', translation: args.title}),
                i18n.translate({code: args.pageCode + '.seo.description', translation: args.description})
            ]).then(function () {
                self.seo = {
                    siteName: args.siteName,
                    defaultTitle: args.defaultTitle,
                    title: args.title,
                    description: args.description
                };
                updateTags();
                if (args && args.success) args.success();
            });
        };

        this.resolve = function () {
            this.getSEOValues({
                success: updateTags
            });
        };

        function getNamespace() {
            return config.namespace.charAt(0).toUpperCase() + config.namespace.substring(1);
        }

        function updateTags() {
            self.updateTitleTag();
            self.updateDescriptionTag();
            updateMetaTags();
        }

        this.updateTitleTag = function (t) {
            var title = self.seo.title || t || self.seo.defaultTitle || '';
            var siteName = self.seo.siteName || '';
            var divider = title && siteName ? ' | ' : '';
            var pageTitle = title + divider + siteName;
            updateTag({tag: 'title', content: pageTitle});
            updateMetaTag({property: 'og:title', content: title});
        };

        this.updateDescriptionTag = function (d) {
            var description = self.seo.description || d || '';
            updateMetaTag({name: 'description', content: description});
            updateMetaTag({property: 'og:description', content: description});
        };

        this.updateImageMetaTag = function (url) {
            updateMetaTag({property: 'og:image', content: url});
        };

        function updateTag(args) {
            var result = head.find(args.tag);
            if (result.length == 0) {
                if (args.content) head.prepend('<' + args.tag + '>' + args.content + '</' + args.tag + '>');
            } else args.content ? result[0].textContent = args.content : result[0].remove();
        }

        function updateMetaTags() {
            updateMetaTag({name: 'author', content: self.seo.siteName});
            updateMetaTag({property: 'og:type', content: 'website'});
            updateMetaTag({property: 'og:site_name', content: self.seo.siteName});
            updateMetaTag({property: 'og:url', content: $location.absUrl()});
        }

        function updateMetaTag(args) {
            var type = args.property ? 'property' : 'name';
            var id = args.property || args.name;
            var result = head.find('meta[' + type + '="' + id + '"]');
            if (result.length == 0) {
                if (args.content) head.append('<meta ' + type + '="' + id + '" content="' + args.content + '">');
            } else args.content ? result[0].content = args.content : result[0].remove();
        }
    }

    function seoSupportDirectiveFactory(editModeRenderer, seoSupport, binarta) {
        return {
            restrict: 'A',
            scope: true,
            link: function (scope) {
                scope.open = function () {
                    var rendererScope = scope.$new();
                    rendererScope.close = function () {
                        editModeRenderer.close();
                    };

                    binarta.checkpoint.profile.hasPermission('seo.edit') ? isPermitted() : unavailable();

                    function isPermitted() {
                        seoSupport.getSEOValues({success: withSEOValues});

                        function withSEOValues(seo) {
                            rendererScope.seo = seo;
                            rendererScope.seo.pageCode = binarta.application.unlocalizedPath();

                            editModeRenderer.open({
                                templateUrl: 'bin-seo-edit.html',
                                scope: rendererScope
                            });

                            rendererScope.save = function (args) {
                                rendererScope.working = true;
                                args.success = function () {
                                    editModeRenderer.close();
                                };
                                seoSupport.update(args);
                            };
                        }
                    }

                    function unavailable() {
                        editModeRenderer.open({
                            templateUrl: 'bin-seo-unavailable.html',
                            scope: rendererScope
                        });
                    }
                };
            }
        }
    }

    function SeoTitleDirective(seoSupport) {
        return {
            restrict: 'A',
            link: function (scope, el) {
                seoSupport.getSEOValues({
                    success: onSuccess
                });

                function onSuccess(seo) {
                    if (!seo.title) watchOnElement();
                }

                function watchOnElement() {
                    scope.$watch(function () {
                        return el[0].innerText;
                    }, function (value) {
                        if (value) seoSupport.updateTitleTag(value);
                    });
                }
            }
        }
    }

    function SeoDescriptionDirective($filter, seoSupport) {
        return {
            restrict: 'A',
            link: function (scope, el) {
                seoSupport.getSEOValues({
                    success: onSuccess
                });

                function onSuccess(seo) {
                    if (!seo.description) watchOnElement();
                }

                function watchOnElement() {
                    scope.$watch(function () {
                        return el[0].innerText;
                    }, function (value) {
                        if (value) seoSupport.updateDescriptionTag($filter('binTruncate')(value, 160));
                    });
                }
            }
        }
    }

    function SeoImageDirective(seoSupport) {
        return {
            restrict: 'A',
            link: function (scope, el) {
                scope.$watch(function () {
                    return el[0].src;
                }, function (value) {
                    if (value) seoSupport.updateImageMetaTag(value);
                });
            }
        }
    }
})();