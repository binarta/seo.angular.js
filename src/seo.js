angular.module('seo', [])
    .service('seoSupport', ['i18n', 'config', '$location', 'topicRegistry', '$q', '$rootScope', SeoSupportService])
    .directive('seoSupport', ['editModeRenderer', 'seoSupport', '$rootScope', 'activeUserHasPermission', seoSupportDirectiveFactory])
    .run(['seoSupport', '$rootScope', function (seoSupport, $rootScope) {
        $rootScope.$on('$routeChangeSuccess', function () {
            seoSupport.resolve();
        });
    }]);

function SeoSupportService(i18n, config, $location, topicRegistry, $q, $rootScope) {
    var locale;

    $rootScope.seo = {};

    topicRegistry.subscribe('i18n.locale', function (l) {
        locale = l;
    });

    function getUnlocalizedPath() {
        return $location.path().replace('/' + locale, '');
    }

    this.update = function (args) {
        $q.all([
            i18n.translate({
                code: 'seo.title.default',
                translation: args.defaultTitle
            }),
            i18n.translate({
                code: getUnlocalizedPath() + '.seo.title',
                translation: args.title
            }),
            i18n.translate({
                code: getUnlocalizedPath() + '.seo.description',
                translation: args.description
            })
        ]).then(function () {
            $rootScope.seo = args;
        });
    };

    this.resolve = function () {
        $q.all([
            i18n.resolve({
                code: 'seo.title.default',
                default: config.namespace
            }),
            i18n.resolve({
                code: getUnlocalizedPath() + '.seo.title',
                default: ' '
            }),
            i18n.resolve({
                code: getUnlocalizedPath() + '.seo.description',
                default: ' '
            })
        ]).then(function (result) {
            $rootScope.seo = {
                defaultTitle: result[0],
                title: result[1].trim(),
                description: result[2].trim()
            };
        });
    };
}

function seoSupportDirectiveFactory(editModeRenderer, seoSupport, $rootScope, activeUserHasPermission) {
    return {
        restrict: 'A',
        scope: true,
        link: function (scope) {
            scope.open = function () {
                activeUserHasPermission({
                    no: function () {
                        editModeRenderer.open({
                            ctx: {
                                close: function () {
                                    editModeRenderer.close();
                                }
                            },
                            template: "<form><p>Vanaf een Essential abonnement kun je de titel en omschrijving " +
                            "van al je pagina's aanpassen. Zo zorg je ervoor dat je pagina's mooi worden " +
                            "weergegeven in de zoekresultaten.</p></form>" +
                            "<div class=\"dropdown-menu-buttons\">" +
                            "<a class=\"btn btn-success\" href=\"https://binarta.com/#!/applications\" target=\"_blank\">Upgraden</a>" +
                            "<button type=\"reset\" class=\"btn btn-default\" ng-click=\"close()\">Sluiten</button>" +
                            "</div>"
                        });
                    },
                    yes: function () {
                        editModeRenderer.open({
                            ctx: {
                                seo: angular.copy($rootScope.seo),
                                save: function (args) {
                                    seoSupport.update(args);
                                    editModeRenderer.close();
                                },
                                close: function () {
                                    editModeRenderer.close();
                                }
                            },
                            template: '<form>' +
                            '<div class=\"form-group\">' +
                            '<label for=\"inputDefaultTitle\">Standaard paginatitel</label>' +
                            '<input type=\"text\" id=\"inputDefaultTitle\" ng-model=\"seo.defaultTitle\">' +
                            '<small><i class=\"fa fa-info-circle\"></i> Wordt gebruikt als er geen pagina specifieke titel is gedefinieerd.</small>' +
                            '</div>' +

                            '<div class=\"form-group\">' +
                            '<label for=\"inputTitle\">Paginatitel</label>' +
                            '<input type=\"text\" id=\"inputTitle\" ng-model=\"seo.title\">' +
                            '<small><i class=\"fa fa-info-circle\"></i> Maak de titel niet langer dan 60 tekens in het formaat "Primair trefwoord - Secundair trefwoord | Merknaam".</small>' +
                            '</div>' +

                            '<div class=\"form-group\">' +
                            '<label for=\"inputDescription\">Paginabescrijving</label>' +
                            '<textarea id=\"inputDescription\" ng-model=\"seo.description\"></textarea>' +
                            '<small><i class=\"fa fa-info-circle\"></i> Maak de beschrijving niet langer dan 160 tekens.</small>' +
                            '</div>' +
                            '</form>' +
                            '<div class=\"dropdown-menu-buttons\">' +
                            '<button type=\"submit\" class=\"btn btn-primary\" ng-click=\"save(seo)\">Opslaan</button>' +
                            '<button type=\"reset\" class=\"btn btn-default\" ng-click=\"close()\">Annuleren</button>' +
                            '</div>'
                        });
                    }
                }, 'seo.edit');
            };
        }
    }
}