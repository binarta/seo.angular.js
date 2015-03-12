angular.module('seo', ['i18n', 'config', 'toggle.edit.mode', 'checkpoint'])
    .service('seoSupport', ['i18n', '$location', '$q', 'localeResolver', '$document', 'config', SeoSupportService])
    .directive('seoSupport', ['editModeRenderer', 'seoSupport', 'activeUserHasPermission', seoSupportDirectiveFactory])
    .run(['seoSupport', '$rootScope', function (seoSupport, $rootScope) {
        $rootScope.$on('$routeChangeSuccess', function () {
            seoSupport.resolve();
        });
    }]);

function SeoSupportService(i18n, $location, $q, localeResolver, $document, config) {
    var self = this;
    var head = $document.find('head');

    this.seo = {};

    this.getPageCode = function () {
        return $location.path().replace('/' + localeResolver(), '');
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
        if (element.length == 1) element[0].innerText = title;
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
            else element[0].remove();
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
                activeUserHasPermission({
                    no: function () {
                        editModeRenderer.open({
                            template: '<form><p>Vanaf een Essential abonnement kun je de titel en omschrijving ' +
                            "van al je pagina's aanpassen. Zo zorg je ervoor dat je pagina's mooi worden " +
                            'weergegeven in de zoekresultaten.</p></form>' +
                            '<div class="dropdown-menu-buttons">' +
                            '<a class="btn btn-success" href="https://binarta.com/#!/applications" target="_blank">Upgraden</a>' +
                            '<button type="reset" class="btn btn-default" ng-click="close()">Sluiten</button>' +
                            '</div>',
                            scope: scope
                        });
                    },
                    yes: function () {
                        scope.seo = angular.copy(seoSupport.seo);
                        scope.seo.pageCode = seoSupport.getPageCode();

                        editModeRenderer.open({
                            template: '<form>' +
                            '<div class="form-group">' +

                            '<div class="form-group">' +
                            '<label for="inputSiteName">Merknaam of naam van je website</label>' +
                            '<input type="text" id="inputSiteName" ng-model="seo.siteName">' +
                            '</div>' +

                            '<label for="inputDefaultTitle">Standaard paginatitel</label>' +
                            '<input type="text" id="inputDefaultTitle" ng-model="seo.defaultTitle">' +
                            '<small><i class="fa fa-info-circle"></i> Wordt gebruikt als er geen pagina specifieke titel is gedefinieerd.</small>' +
                            '</div>' +

                            '<div class="form-group">' +
                            '<label for="inputTitle">Paginatitel</label>' +
                            '<input type="text" id="inputTitle" ng-model="seo.title">' +
                            '<small><i class="fa fa-info-circle"></i> Maak de titel niet langer dan 60 tekens.</small>' +
                            '</div>' +

                            '<div class="form-group">' +
                            '<label for="inputDescription">Paginabeschrijving</label>' +
                            '<textarea id="inputDescription" ng-model="seo.description"></textarea>' +
                            '<small><i class="fa fa-info-circle"></i> Maak de beschrijving niet langer dan 160 tekens.</small>' +
                            '</div>' +
                            '</form>' +
                            '<div class="dropdown-menu-buttons">' +
                            '<button type="submit" class="btn btn-primary" ng-click="save(seo)">Opslaan</button>' +
                            '<button type="reset" class="btn btn-default" ng-click="close()">Annuleren</button>' +
                            '</div>',
                            scope: scope
                        });

                        scope.save = function (args) {
                            seoSupport.update(args);
                            editModeRenderer.close();
                        };
                    }
                }, 'seo.edit');

                scope.close = function () {
                    editModeRenderer.close();
                };
            };
        }
    }
}