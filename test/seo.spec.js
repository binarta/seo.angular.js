describe('seo', function () {
    angular.module('i18n', []).service('i18n', ['$q', function ($q) {
        this.resolveSpy = {};
        this.updateSpy = {};

        this.resolve = function (ctx) {
            var deferred = $q.defer();

            this.resolveSpy[ctx.code] = ctx.default;

            deferred.resolve(ctx.default);
            return deferred.promise;
        };
        this.translate = function (ctx) {
            var deferred = $q.defer();

            this.updateSpy[ctx.code] = ctx.translation;

            deferred.resolve('ok');
            return deferred.promise;
        };
    }]);

    beforeEach(module('seo'));
    beforeEach(module('notifications'));
    beforeEach(module('config'));
    beforeEach(module('i18n'));

    describe('seoSupport service', function () {
        var seoSupport,
            i18n,
            $rootScope,
            registry,
            defaultTitle = 'Powered by Binarta',
            path = '/test/path',
            locale = 'en';

        beforeEach(inject(function ($location) {
            $location.path(path + '/' + locale);
        }));

        beforeEach(inject(function(_seoSupport_, _i18n_, _$rootScope_, topicRegistryMock) {
            seoSupport = _seoSupport_;
            i18n = _i18n_;
            $rootScope = _$rootScope_;
            registry = topicRegistryMock;
            registry['i18n.locale'](locale);

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
            beforeEach(function () {
                seoSupport.update({
                    defaultTitle: 'default title',
                    title: 'title',
                    description: 'description'
                });

                $rootScope.$digest();
            });

            it('i18n messages are translated', function () {
                expect(i18n.updateSpy['seo.title.default']).toEqual('default title');
                expect(i18n.updateSpy[path + '.seo.title']).toEqual('title');
                expect(i18n.updateSpy[path + '.seo.description']).toEqual('description');
            });

            it('values are on rootScope', function () {
                expect($rootScope.seo).toEqual({
                    defaultTitle: 'default title',
                    title: 'title',
                    description: 'description'
                });
            });
        });
    });


    describe('seoSupport directive', function () {
        var directive, editModeRendererSpy, editModeRendererClosed, seoSupportSpy, $rootScope, scope,
            permissionNo, permissionYes, permission;

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

            var seoSupport = {
                update: function (args) {
                    seoSupportSpy = args;
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
                            expect(editModeRendererSpy).toEqual({
                                ctx: {
                                    close: jasmine.any(Function)
                                },
                                template: jasmine.any(String)
                            });
                        });

                        it('and close is called', function () {
                            editModeRendererSpy.ctx.close();

                            expect(editModeRendererClosed).toBeTruthy();
                        });
                    });

                    describe('if has permission', function () {
                        beforeEach(function () {
                            permissionYes();
                        });

                        it('editModeRenderer is called', function () {
                            expect(editModeRendererSpy).toEqual({
                                ctx: {
                                    seo: $rootScope.seo,
                                    save: jasmine.any(Function),
                                    close: jasmine.any(Function)
                                },
                                template: jasmine.any(String)
                            });
                        });

                        it('and close is called', function () {
                            editModeRendererSpy.ctx.close();

                            expect(editModeRendererClosed).toBeTruthy();
                        });

                        it('and save is called', function () {
                            editModeRendererSpy.ctx.save('new values');

                            expect(seoSupportSpy).toEqual('new values');
                            expect(editModeRendererClosed).toBeTruthy();
                        });
                    });
                });
            });
        });
    });
});
