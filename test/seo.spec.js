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

    angular.module('angularx', [])
        .factory('binTruncateSpy', function() {
            return jasmine.createSpy('binTruncateSpy');
        })
        .filter('binTruncate', function (binTruncateSpy) {
            return function (value, length) {
                binTruncateSpy({value: value, length: length});
                return value;
            }
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

    describe('seoTitle directive', function () {
        var title, element, scope;

        beforeEach(inject(function ($document, $rootScope, $compile, seoSupport) {
            seoSupport.resolve();

            var head = $document.find('head');
            title = head.find('title');
            scope = $rootScope.$new();
            element = angular.element('<div seo-title>{{var}}</div>');
            $compile(element)(scope);
            scope.var = 'Page title';
            scope.$digest();
        }));

        it('title element is updated', function () {
            expect(title[0].innerText).toEqual('Page title | Namespace');
        });

        it('When element changes', function () {
            scope.var = 'changed title';
            scope.$digest();

            expect(title[0].innerText).toEqual('changed title | Namespace');
        });
    });

    describe('seoDirective directive', function () {
        var element, scope, seoSupport, binTruncateSpy;

        beforeEach(inject(function ($document, $rootScope, $compile, _seoSupport_, _binTruncateSpy_) {
            seoSupport = _seoSupport_;
            binTruncateSpy = _binTruncateSpy_;
            seoSupport.updateDescriptionElement = jasmine.createSpy('updateDescriptionElement');
            scope = $rootScope.$new();
            element = angular.element('<div seo-description>{{var}}</div>');
            $compile(element)(scope);
            scope.var = 'foo bar';
            scope.$digest();
        }));

        it('meta description element is updated', function () {
            expect(binTruncateSpy).toHaveBeenCalledWith({
                value: 'foo bar',
                length: 160
            });
            expect(seoSupport.updateDescriptionElement).toHaveBeenCalledWith('foo bar');
        });

        it('When element changes', function () {
            scope.var = 'changed description';
            scope.$digest();

            expect(binTruncateSpy).toHaveBeenCalledWith({
                value: 'changed description',
                length: 160
            });
            expect(seoSupport.updateDescriptionElement).toHaveBeenCalledWith('changed description');
        });
    });

    describe('seoImage directive', function () {
        var element, scope, seoSupport;

        beforeEach(inject(function ($document, $rootScope, $compile, _seoSupport_) {
            seoSupport = _seoSupport_;
            seoSupport.updateImageMetaTag = jasmine.createSpy('updateImageMetaTag');
            seoSupport.updateImageMetaTag.reset();
            scope = $rootScope.$new();
            element = angular.element('<image src="{{var}}" seo-image />');
            $compile(element)(scope);
            scope.var = 'http://image-url.jpg/';
            scope.$digest();
        }));

        it('image meta element is updated', function () {
            expect(seoSupport.updateImageMetaTag).toHaveBeenCalledWith('http://image-url.jpg/');
        });

        it('When element changes', function () {
            scope.var = 'http://another-url.jpg/';
            scope.$digest();

            expect(seoSupport.updateImageMetaTag).toHaveBeenCalledWith('http://another-url.jpg/');
        });
    });
});
