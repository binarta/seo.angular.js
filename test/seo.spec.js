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
        .factory('localeResolver', function () {
            return function () {
                return locale;
            };
        });

    beforeEach(module('seo'));
    beforeEach(module('i18n'));

    describe('seoSupport service', function () {
        var seoSupport,
            i18n,
            $rootScope,
            $location,
            defaultTitle = 'Powered by Binarta',
            path = '/test/path';

        beforeEach(inject(function(_seoSupport_, _i18n_, _$rootScope_, _$location_) {
            seoSupport = _seoSupport_;
            i18n = _i18n_;
            $rootScope = _$rootScope_;
            $location = _$location_;

            $location.path(path + '/' + locale);
            seoSupport.resolve();
            $rootScope.$digest();
        }));

        it('i18n message are resolved', function () {
            expect(i18n.resolveSpy['seo.title.default']).toEqual(defaultTitle);
            expect(i18n.resolveSpy[path + '.seo.title']).toEqual(' ');
            expect(i18n.resolveSpy[path + '.seo.description']).toEqual(' ');
        });

        it('put default seo values on rootScope', function () {
            expect($rootScope.seo).toEqual({
                defaultTitle: defaultTitle,
                title: '',
                description: ''
            });
        });


        describe('when updated', function () {
            var newPath = '/new/path';

            beforeEach(function () {
                $location.path(newPath + '/' + locale);

                seoSupport.update({
                    defaultTitle: 'default title',
                    title: 'title',
                    description: 'description',
                    pageCode: newPath
                });

                $rootScope.$digest();
            });

            it('i18n messages are translated', function () {
                expect(i18n.updateSpy['seo.title.default']).toEqual('default title');
                expect(i18n.updateSpy[newPath + '.seo.title']).toEqual('title');
                expect(i18n.updateSpy[newPath + '.seo.description']).toEqual('description');
            });

            it('values are on rootScope', function () {
                expect(i18n.resolveSpy['seo.title.default']).toEqual('default title');
                expect(i18n.resolveSpy[newPath + '.seo.title']).toEqual('title');
                expect(i18n.resolveSpy[newPath + '.seo.description']).toEqual('description');
            });
        });

        it('get pageCode', function () {
            expect(seoSupport.getPageCode()).toEqual(path);
        });
    });


    describe('seoSupport directive', function () {
        var directive, editModeRendererSpy, editModeRendererClosed, seoSupportSpy, $rootScope, scope,
            permissionNo, permissionYes, permission, pageCode;

        beforeEach(inject(function (_$rootScope_) {
            $rootScope = _$rootScope_;
            scope = $rootScope.$new();
            $rootScope.seo = {
                defaultTitle: 'default title',
                title: 'title',
                description: 'description'
            };

            var editModeRenderer = {
                open: function (args) {
                    editModeRendererSpy = args;
                },
                close: function () {
                    editModeRendererClosed = true;
                }
            };

            pageCode = '/page/code';
            var seoSupport = {
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

            directive = seoSupportDirectiveFactory(editModeRenderer, seoSupport, $rootScope, activeUserHasPermission);
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
                        });

                        it('editModeRenderer is called', function () {
                            expect(editModeRendererSpy.template).toEqual(jasmine.any(String));
                            expect(editModeRendererSpy.scope.seo.defaultTitle).toEqual($rootScope.seo.defaultTitle);
                            expect(editModeRendererSpy.scope.seo.title).toEqual($rootScope.seo.title);
                            expect(editModeRendererSpy.scope.seo.description).toEqual($rootScope.seo.description);
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
