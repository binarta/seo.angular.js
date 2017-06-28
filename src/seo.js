(function () {
    angular.module('seo', ['binarta-applicationjs-angular1', 'binarta-checkpointjs-angular1', 'i18n', 'config',
        'toggle.edit.mode', 'ngRoute', 'angularx'])
        .service('seoSupport', ['$q', '$document', 'i18n', 'config', 'binarta', SeoSupportService])
        .directive('seoSupport', ['editModeRenderer', 'seoSupport', 'binarta', seoSupportDirectiveFactory])
        .run(['$rootScope', 'seoSupport', function ($rootScope, seoSupport) {
            $rootScope.$on('$routeChangeStart', function () {
                seoSupport.updateTitleTag();
            });
        }]);

    function SeoSupportService($q, $document, i18n, config, binarta) {
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

        this.updateTitleTag = function () {
            this.getSEOValues({success: updateTitleTag});
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
                updateTitleTag();
                if (args && args.success) args.success();
            });
        };

        function getNamespace() {
            return config.namespace.charAt(0).toUpperCase() + config.namespace.substring(1);
        }

        function updateTitleTag() {
            var title = self.seo.title || self.seo.defaultTitle || '';
            var siteName = self.seo.siteName || '';
            var divider = title && siteName ? ' | ' : '';
            var pageTitle = title + divider + siteName;
            updateTag({tag: 'title', content: pageTitle});
        }

        function updateTag(args) {
            var result = head.find(args.tag);
            if (result.length === 0) {
                if (args.content) head.prepend('<' + args.tag + '>' + args.content + '</' + args.tag + '>');
            } else args.content ? result[0].textContent = args.content : result[0].remove();
        }

        head.append('<link rel="apple-touch-icon" sizes="180x180" href="' + config.awsPath + 'favicon.img?height=180">');
        head.append('<link rel="icon" type="image/png" sizes="32x32" href="' + config.awsPath + 'favicon.img?height=32">');
        head.append('<link rel="icon" type="image/png" sizes="16x16" href="' + config.awsPath + 'favicon.img?height=16">');
    }

    function seoSupportDirectiveFactory(editModeRenderer, seoSupport, binarta) {
        return {
            restrict: 'A',
            scope: true,
            link: function (scope) {
                scope.open = function () {
                    var editScope = scope.$new();
                    editScope.close = function () {
                        editModeRenderer.close();
                    };

                    function UnavailableState() {
                        this.name = 'unavailable';
                    }

                    function SeoState() {
                        var state = this;
                        this.name = 'seo';
                        this.switchState = function () {
                            editScope.state = new FaviconState();
                        };

                        seoSupport.getSEOValues({success: withSEOValues});

                        function withSEOValues(seo) {
                            state.seo = seo;
                            state.seo.pageCode = binarta.application.unlocalizedPath();

                            state.save = function () {
                                editScope.working = true;
                                state.seo.success = function () {
                                    editModeRenderer.close();
                                };
                                seoSupport.update(state.seo);
                            };
                        }
                    }

                    function FaviconState() {
                        this.name = 'favicon';
                        this.isPermitted = binarta.checkpoint.profile.hasPermission('favicon.upload');
                        this.switchState = function () {
                            editScope.state = new SeoState();
                        };
                    }

                    editScope.save = function () {
                        if (editScope.state.save) editScope.state.save();
                    };

                    editScope.switchState = function () {
                        if (editScope.state.switchState) editScope.state.switchState();
                    };

                    editScope.state = binarta.checkpoint.profile.hasPermission('seo.edit') ? new SeoState() : new UnavailableState();

                    editModeRenderer.open({
                        templateUrl: 'bin-seo-edit.html',
                        scope: editScope
                    });
                };
            }
        }
    }
})();