describe('seo', function () {
    var locale = 'en';

    angular.module('i18n', [])
        .service('i18n', ['$q', function ($q) {
            this.resolveSpy = {};
            this.updateSpy = {};

            this.resolve = function (ctx) {
                var deferred = $q.defer();

                this.resolveSpy[ctx.code] = this.updateSpy[ctx.code] || ctx.default;

                deferred.resolve(ctx.default);
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
                return locale;
            };
        });

    angular.module('config', [])
        .service('config', function () {
            this.namespace = 'namespace'
        });

    angular.module('toggle.edit.mode', []);
    angular.module('checkpoint', []);
    beforeEach(module('seo'));
    beforeEach(module('i18n'));

    describe('seoSupport service', function () {
        var seoSupport,
            i18n,
            $rootScope,
            $location,
            defaultSiteName = 'Namespace',
            defaultTitle = 'Powered by Binarta',
            path = '/unlocalized/path',
            head;

        beforeEach(inject(function(_seoSupport_, _i18n_, _$rootScope_, _$location_, $document) {
            seoSupport = _seoSupport_;
            i18n = _i18n_;
            $rootScope = _$rootScope_;
            $location = _$location_;
            head = $document.find('head');

            seoSupport.resolve();
            $rootScope.$digest();
        }));

        it('default message are resolved', function () {
            expect(i18n.resolveSpy['seo.site.name']).toEqual(defaultSiteName);
            expect(i18n.resolveSpy['seo.title.default']).toEqual(defaultTitle);
            expect(i18n.resolveSpy[path + '.seo.title']).toEqual(' ');
            expect(i18n.resolveSpy[path + '.seo.description']).toEqual(' ');
            expect(i18n.resolveSpy[path + '.seo.meta.type']).toEqual('website');
            expect(i18n.resolveSpy[path + '.seo.meta.image']).toEqual(' ');
        });

        it('seo values are available', function () {
            expect(seoSupport.seo).toEqual({
                siteName: defaultSiteName,
                defaultTitle: defaultTitle,
                title: '',
                description: '',
                meta: {
                    type: 'website',
                    image: ''
                }
            });
        });

        it('title element is updated', function () {
            var title = head.find('title');
            expect(title[0].innerText).toEqual(defaultTitle + ' | ' + defaultSiteName);
        });

        describe('on update', function () {
            beforeEach(function () {
                seoSupport.update({
                    siteName: 'site name',
                    defaultTitle: 'default title',
                    title: 'title',
                    description: 'description',
                    pageCode: path
                });

                $rootScope.$digest();
            });

            it('messages are translated', function () {
                expect(i18n.updateSpy['seo.site.name']).toEqual('site name');
                expect(i18n.updateSpy['seo.title.default']).toEqual('default title');
                expect(i18n.updateSpy[path + '.seo.title']).toEqual('title');
                expect(i18n.updateSpy[path + '.seo.description']).toEqual('description');
            });

            it('values are available', function () {
                expect(i18n.resolveSpy['seo.site.name']).toEqual('site name');
                expect(i18n.resolveSpy['seo.title.default']).toEqual('default title');
                expect(i18n.resolveSpy[path + '.seo.title']).toEqual('title');
                expect(i18n.resolveSpy[path + '.seo.description']).toEqual('description');
            });
        });

        describe('on update title', function () {
            beforeEach(function () {
                seoSupport.updateTitle('new value');
                $rootScope.$digest();
            });

            it('message is translated', function () {
                expect(i18n.updateSpy[path + '.seo.title']).toEqual('new value');
            });
        });

        describe('on update description', function () {
            beforeEach(function () {
                seoSupport.updateDescription('new value');
                $rootScope.$digest();
            });

            it('message is translated', function () {
                expect(i18n.updateSpy[path + '.seo.description']).toEqual('new value');
            });
        });

        describe('on update meta type', function () {
            beforeEach(function () {
                seoSupport.updateMetaType('new value');
                $rootScope.$digest();
            });

            it('message is translated', function () {
                expect(i18n.updateSpy[path + '.seo.meta.type']).toEqual('new value');
            });
        });

        describe('on update meta image', function () {
            beforeEach(function () {
                seoSupport.updateMetaImage('new value');
                $rootScope.$digest();
            });

            it('message is translated', function () {
                expect(i18n.updateSpy[path + '.seo.meta.image']).toEqual('new value');
            });
        });
    });


    describe('seoSupport directive', function () {
        var directive, editModeRendererSpy, editModeRendererClosed, seoSupportSpy, $rootScope, seoSupport, scope,
            permissionNo, permissionYes, permission, pageCode;

        beforeEach(inject(function (_$rootScope_, i18nLocation) {
            $rootScope = _$rootScope_;
            scope = $rootScope.$new();

            var editModeRenderer = {
                open: function (args) {
                    editModeRendererSpy = args;
                },
                close: function () {
                    editModeRendererClosed = true;
                }
            };

            pageCode = '/unlocalized/path';
            seoSupport = {
                seo: {
                    values: 'foo'
                },
                update: function (args) {
                    seoSupportSpy = args;
                },
                getPageCode: function () {
                    return pageCode;
                }
            };

            var activeUserHasPermission = function (args, p) {
                permissionNo = args.no;
                permissionYes = args.yes;
                permission = p;
            };

            directive = seoSupportDirectiveFactory(editModeRenderer, seoSupport, activeUserHasPermission, i18nLocation);
        }));

        it('restrict to attribute', function () {
            expect(directive.restrict).toEqual('A');
        });

        it('uses child scope', function () {
            expect(directive.scope).toEqual(true);
        });

        describe('on link', function () {
            beforeEach(function () {
                directive.link(scope);
            });

            describe('when open is triggered', function () {
                beforeEach(function () {
                    scope.open();
                });

                describe('check for permission', function () {
                    it('permission is seo.edit', function () {
                        expect(permission).toEqual('seo.edit');
                    });

                    describe('if no permission', function () {
                        beforeEach(function () {
                            permissionNo();
                        });

                        it('editModeRenderer is called', function () {
                            expect(editModeRendererSpy.template).toEqual(jasmine.any(String));
                            expect(editModeRendererSpy.scope.$parent).toEqual(scope);
                            expect(editModeRendererSpy.scope.close).toEqual(jasmine.any(Function));
                        });

                        it('and close is called', function () {
                            editModeRendererSpy.scope.close();

                            expect(editModeRendererClosed).toBeTruthy();
                        });
                    });

                    describe('if has permission', function () {
                        beforeEach(function () {
                            permissionYes();
                            $rootScope.$digest();
                        });

                        it('editModeRenderer is called', function () {
                            expect(editModeRendererSpy.template).toEqual(jasmine.any(String));
                            expect(editModeRendererSpy.scope.$parent).toEqual(scope);
                            expect(editModeRendererSpy.scope.seo.values).toEqual(seoSupport.seo.values);
                        });

                        it('and pageCode is set to seo', function () {
                            expect(editModeRendererSpy.scope.seo.pageCode).toEqual(pageCode);
                        });

                        it('and close is called', function () {
                            editModeRendererSpy.scope.close();

                            expect(editModeRendererClosed).toBeTruthy();
                        });

                        it('and save is called', function () {
                            editModeRendererSpy.scope.save('new values');

                            expect(seoSupportSpy).toEqual('new values');
                            expect(editModeRendererClosed).toBeTruthy();
                        });
                    });
                });
            });
        });
    });
});
