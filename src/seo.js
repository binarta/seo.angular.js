angular.module('seo', ['i18n', 'config', 'toggle.edit.mode', 'checkpoint', 'ngRoute'])
    .service('seoSupport', ['i18n', '$location', '$q', '$routeParams', '$document', 'config', SeoSupportService])
    .directive('seoSupport', ['editModeRenderer', 'seoSupport', 'activeUserHasPermission', seoSupportDirectiveFactory])
    .run(['seoSupport', '$rootScope', function (seoSupport, $rootScope) {
        $rootScope.$on('$routeChangeSuccess', function () {
            seoSupport.resolve();
        });
    }]);

function SeoSupportService(i18n, $location, $q, $routeParams, $document, config) {
    var self = this;
    var head = $document.find('head');

    this.seo = {};

    this.getPageCode = function () {
        var path = $location.path();
        return $routeParams.locale ? path.replace('/' + $routeParams.locale, '') : path;
    };

    this.update = function (args) {
        $q.all([
            i18n.translate({
                code: 'seo.site.name',
                translation: args.siteName
            }),
            i18n.translate({
                code: 'seo.title.default',
                translation: args.defaultTitle
            }),
            i18n.translate({
                code: args.pageCode + '.seo.title',
                translation: args.title
            }),
            i18n.translate({
                code: args.pageCode + '.seo.description',
                translation: args.description
            })
        ]).then(function () {
            self.resolve();
        });
    };

    this.updateTitle = function (title) {
        i18n.translate({
            code: self.getPageCode() + '.seo.title',
            translation: title
        });
    };

    this.updateDescription = function (description) {
        i18n.translate({
            code: self.getPageCode() + '.seo.description',
            translation: description
        });
    };

    this.updateMetaType = function (type) {
        i18n.translate({
            code: self.getPageCode() + '.seo.meta.type',
            translation: type
        });
    };

    this.updateMetaImage = function (image) {
        i18n.translate({
            code: self.getPageCode() + '.seo.meta.image',
            translation: image
        });
    };

    this.resolve = function () {
        $q.all([
            i18n.resolve({
                code: 'seo.site.name',
                default: isPublished() ? getNamespace() : 'Binarta'
            }),
            i18n.resolve({
                code: 'seo.title.default',
                default: 'Powered by Binarta'
            }),
            i18n.resolve({
                code: self.getPageCode() + '.seo.title',
                default: ' '
            }),
            i18n.resolve({
                code: self.getPageCode() + '.seo.description',
                default: ' '
            }),
            i18n.resolve({
                code: self.getPageCode() + '.seo.meta.type',
                default: 'website'
            }),
            i18n.resolve({
                code: self.getPageCode() + '.seo.meta.image',
                default: ' '
            })
        ]).then(function (result) {
            self.seo = {
                siteName: result[0].trim(),
                defaultTitle: result[1].trim(),
                title: result[2].trim(),
                description: result[3].trim(),
                meta: {
                    type: result[4].trim(),
                    image: result[5].trim()
                }
            };

            UpdateTitleElement(self.seo);
            UpdateDescriptionElement(self.seo);
            UpdateMetaTags(self.seo);
        });
    };

    function UpdateTitleElement(seo) {
        var element = head.find('title');
        var title = (seo.title || seo.defaultTitle) + (seo.siteName ? ' | ' + seo.siteName : '');
        if (element.length == 1) element[0].textContent = title;
        else head.prepend('<title>' + title + '</title>');
    }

    function UpdateDescriptionElement(seo) {
        var element = head.find('meta[name="description"]');
        if (element.length == 1) element[0].content = seo.description;
        else head.prepend('<meta name="description" content="' + seo.description + '">');
    }

    function UpdateMetaTags(seo) {
        UpdateOpenGraphMetaTag('og:title', (seo.title || seo.defaultTitle));
        UpdateOpenGraphMetaTag('og:type', seo.meta.type);
        UpdateOpenGraphMetaTag('og:site_name', seo.siteName);
        UpdateOpenGraphMetaTag('og:description', seo.description);
        UpdateOpenGraphMetaTag('og:url', $location.absUrl());
        UpdateOpenGraphMetaTag('og:image', seo.meta.image);
    }

    function UpdateOpenGraphMetaTag(property, content) {
        var element = head.find('meta[property="' + property + '"]');
        if (element.length == 1) {
            if (content) element[0].content = content;
            else element.remove();
        }
        else {
            if (content) head.append('<meta property="' + property + '" content="' + content + '">');
        }
    }

    function getNamespace() {
        return config.namespace.charAt(0).toUpperCase() + config.namespace.substring(1);
    }

    function isPublished() {
        var host = $location.host();
        var hostToCheck = 'binarta.com';
        return host.indexOf(hostToCheck, host.length - hostToCheck.length) == -1;
    }
}

function seoSupportDirectiveFactory(editModeRenderer, seoSupport, activeUserHasPermission) {
    return {
        restrict: 'A',
        scope: true,
        link: function (scope) {
            scope.open = function () {
                var rendererScope = scope.$new();
                rendererScope.close = function () {
                    editModeRenderer.close();
                };

                activeUserHasPermission({
                    no: function () {
                        editModeRenderer.open({
                            template: '<div class="bin-menu-edit-body"><p i18n code="seo.menu.unavailable.message" read-only>{{var}}</p></div>' +
                            '<div class="bin-menu-edit-actions">' +
                            '<a class="btn btn-success pull-left" ng-href="{{binartaUpgradeUri}}" target="_blank" i18n code="seo.menu.upgrade.button" read-only>{{var}}</a>' +
                            '<button type="reset" class="btn btn-default" ng-click="close()" i18n code="seo.menu.close.button" read-only>{{var}}</button>' +
                            '</div>',
                            scope: rendererScope
                        });
                    },
                    yes: function () {
                        rendererScope.seo = angular.copy(seoSupport.seo);
                        rendererScope.seo.pageCode = seoSupport.getPageCode();

                        editModeRenderer.open({
                            template: '<form class="bin-menu-edit-body">' +
                            '<div class="form-group">' +

                            '<div class="form-group">' +
                            '<label for="inputSiteName" i18n code="seo.menu.site.name.label" read-only>{{var}}</label>' +
                            '<input type="text" id="inputSiteName" ng-model="seo.siteName">' +
                            '</div>' +

                            '<label for="inputDefaultTitle" i18n code="seo.menu.default.title.label" read-only>{{var}}</label>' +
                            '<input type="text" id="inputDefaultTitle" ng-model="seo.defaultTitle">' +
                            '<small i18n code="seo.menu.default.title.info" read-only><i class="fa fa-info-circle"></i> {{var}}</small>' +
                            '</div>' +

                            '<div class="form-group">' +
                            '<label for="inputTitle" i18n code="seo.menu.title.label" read-only>{{var}}</label>' +
                            '<input type="text" id="inputTitle" ng-model="seo.title">' +
                            '<small i18n code="seo.menu.title.info" read-only><i class="fa fa-info-circle"></i> {{var}}</small>' +
                            '</div>' +

                            '<div class="form-group">' +
                            '<label for="inputDescription" i18n code="seo.menu.description.label" read-only>{{var}}</label>' +
                            '<textarea id="inputDescription" ng-model="seo.description"></textarea>' +
                            '<small i18n code="seo.menu.description.info" read-only><i class="fa fa-info-circle"></i> {{var}}</small>' +
                            '</div>' +
                            '</form>' +
                            '<div class="bin-menu-edit-actions">' +
                            '<button type="submit" class="btn btn-primary" ng-click="save(seo)" i18n code="seo.menu.save.button" read-only>{{var}}</button>' +
                            '<button type="reset" class="btn btn-default" ng-click="close()" i18n code="seo.menu.cancel.button" read-only>{{var}}</button>' +
                            '</div>',
                            scope: rendererScope
                        });

                        rendererScope.save = function (args) {
                            seoSupport.update(args);
                            editModeRenderer.close();
                        };
                    }
                }, 'seo.edit');
            };
        }
    }
}