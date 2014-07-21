describe('seo', function () {
    beforeEach(module('seo'));

    describe('seoSupport directive', function () {
        var directive, scope, config, modal, i18nMessageReaderSpy, ctxSpy, onSuccessSpy, onErrorSpy, registry, route;

        beforeEach(inject(function ($rootScope, $location, topicRegistry, topicRegistryMock) {
            ctxSpy = [];
            onSuccessSpy = [];
            onErrorSpy = [];
            scope = $rootScope.$new();
            i18nMessageReaderSpy = function (ctx, onSuccess, onError) {
                ctxSpy[ctx.id] = ctx;
                onSuccessSpy[ctx.id] = onSuccess;
                onErrorSpy[ctx.id] = onError;
            };
            modal = {
                open: {}
            };
            config = {
                namespace: 'namespace'
            };
            registry = topicRegistryMock;
            route = {routes: []};
            route.routes['/template/seo-modal'] = {
                templateUrl: 'seo-modal.html'
            };
            directive = seoSupportDirectiveFactory(modal, i18nMessageReaderSpy, $location, topicRegistry, config, route);
        }));

        it('restrict to class', function () {
            expect(directive.restrict).toEqual('C');
        });

        describe('on link', function () {
            var locale = 'locale';

            beforeEach(inject(function ($location) {
                directive.link(scope);
                $location.path('/' + locale + '/foo/bar');
            }));

            describe('when config is initialized', function () {
                it('namespace is available on scope', function () {
                    registry['config.initialized']();

                    expect(scope.namespace).toEqual('namespace');
                });

                describe('when i18n.locale is received', function () {
                    beforeEach(function () {
                        scope.seo = {
                            defaultTitle: 'old default title',
                            title: 'old title',
                            description: 'old description'
                        };

                        registry['i18n.locale'](locale);
                    });

                    it('put locale on scope', function () {
                        expect(scope.locale).toEqual(locale);
                    });

                    it('reset seo values', function () {
                        expect(scope.seo).toEqual({});
                    });

                    describe('get default title', function () {
                        var titleCtx, defaultTitleCtx;

                        beforeEach(function () {
                            onSuccessSpy['defaultTitle']('default title');

                            defaultTitleCtx = {
                                id: 'defaultTitle',
                                locale: 'locale',
                                code: 'seo.title.default',
                                namespace: scope.namespace,
                                fallback: scope.namespace
                            };

                            titleCtx = {
                                id: 'title',
                                locale: scope.locale,
                                code: '/foo/bar.seo.title',
                                namespace: scope.namespace,
                                fallback: 'default title'
                            };
                        });

                        it('feed context to i18n message reader', function () {
                            expect(ctxSpy['defaultTitle']).toEqual(defaultTitleCtx);
                        });

                        describe('onSuccess with known default title', function () {
                            beforeEach(function () {
                                onSuccessSpy['defaultTitle']('default title');
                            });

                            it('put on scope', function () {
                                expect(scope.seo.defaultTitle).toEqual('default title');
                            });
                        });

                        describe('onSuccess with unknown default title', function () {
                            beforeEach(function () {
                                onSuccessSpy['defaultTitle']('???seo.title.default???');
                            });

                            it('put namespace on scope', function () {
                                expect(scope.seo.defaultTitle).toEqual(scope.namespace);
                            });
                        });

                        describe('onError', function () {
                            beforeEach(function () {
                                onErrorSpy['defaultTitle']();
                            });

                            it('put namespace on scope', function () {
                                expect(scope.seo.defaultTitle).toEqual(scope.namespace);
                            });
                        });

                        describe('openSEOModal is called', function () {
                            var modalInstance, modalClosedSpy;

                            beforeEach(function () {
                                modalInstance = {
                                    result: {
                                        then: function (result) {
                                            modalClosedSpy = result;
                                        }
                                    }
                                };
                                spyOn(modal, 'open').andReturn(modalInstance);
                                scope.openSEOModal();
                            });

                            it('modal is opened', function () {
                                expect(modal.open).toHaveBeenCalled();
                            });

                            it('modal is opened with scope setting', function () {
                                expect(modal.open.mostRecentCall.args[0].scope).toEqual(scope);
                            });

                            it('modal is opened with template url setting', function () {
                                expect(modal.open.mostRecentCall.args[0].templateUrl).toEqual('seo-modal.html');
                            });

                            it('modal is opened with controller setting', function () {
                                expect(modal.open.mostRecentCall.args[0].controller).toEqual(SEOModalInstanceCtrl);
                            });

                            it('modal is opened with backdrop setting', function () {
                                expect(modal.open.mostRecentCall.args[0].backdrop).toEqual('static');
                            });

                            describe('modal is closed', function () {
                                beforeEach(function () {
                                    scope.seo = {
                                        defaultTitle: 'default title',
                                        title: 'title',
                                        description: 'description'
                                    };

                                    scope.seo.input = {
                                        defaultTitle: 'modified default title',
                                        title: 'modified title',
                                        description: 'modified description'
                                    };
                                    modalClosedSpy(scope.seo.input);
                                });

                                it('seo values are set', function () {
                                    expect(scope.seo).toEqual({
                                        defaultTitle: 'modified default title',
                                        title: 'modified title',
                                        description: 'modified description'
                                    });
                                });

                                it('title should be equal to default title if empty', function () {
                                    scope.seo.input = {
                                        defaultTitle: 'modified default title',
                                        title: '',
                                        description: 'modified description'
                                    };
                                    modalClosedSpy(scope.seo.input);

                                    expect(scope.seo).toEqual({
                                        defaultTitle: 'modified default title',
                                        title: 'modified default title',
                                        description: 'modified description'
                                    });
                                });
                            });
                        });

                        describe('on route change success and default title is undefined', function () {
                            beforeEach(function () {
                                scope.seo.defaultTitle = undefined;
                                scope.$broadcast('$routeChangeSuccess');
                            });

                            it('should not get title', function () {
                                expect(ctxSpy['title']).toBeUndefined();
                            });
                        });

                        describe('on route change success', function () {
                            beforeEach(function () {
                                scope.$broadcast('$routeChangeSuccess');
                            });

                            describe('get title', function () {
                                it('feed context to i18n message reader', function () {
                                    expect(ctxSpy['title']).toEqual(titleCtx);
                                });

                                describe('onSuccess with known title', function () {
                                    beforeEach(function () {
                                        onSuccessSpy['title']('title');
                                    });

                                    it('put on scope', function () {
                                        expect(scope.seo.title).toEqual('title');
                                    });
                                });

                                describe('onSuccess with empty title', function () {
                                    beforeEach(function () {
                                        onSuccessSpy['title']('');
                                    });

                                    it('put default title on scope', function () {
                                        expect(scope.seo.title).toEqual('default title');
                                    });
                                });

                                describe('onSuccess with unknown title', function () {
                                    beforeEach(function () {
                                        onSuccessSpy['title']('???/foo/bar.seo.title???');
                                    });

                                    it('put default title on scope', function () {
                                        expect(scope.seo.title).toEqual('default title');
                                    });
                                });

                                describe('onError', function () {
                                    beforeEach(function () {
                                        onErrorSpy['title']();
                                    });

                                    it('put default title on scope', function () {
                                        expect(scope.seo.title).toEqual('default title');
                                    });
                                });
                            });

                            describe('get description', function () {
                                var ctx;

                                beforeEach(function () {
                                    ctx = {
                                        id: 'description',
                                        locale: scope.locale,
                                        code: '/foo/bar.seo.description',
                                        namespace: scope.namespace,
                                        fallback: ''
                                    };
                                });

                                it('feed context to i18n message reader', function () {
                                    expect(ctxSpy['description']).toEqual(ctx);
                                });

                                describe('onSuccess with known description', function () {
                                    beforeEach(function () {
                                        onSuccessSpy['description']('description');
                                    });

                                    it('put on scope', function () {
                                        expect(scope.seo.description).toEqual('description');
                                    });
                                });

                                describe('onSuccess with unknown description', function () {
                                    beforeEach(function () {
                                        onSuccessSpy['description']('???/foo/bar.seo.description???');
                                    });

                                    it('put empty description on scope', function () {
                                        expect(scope.seo.description).toEqual('');
                                    });
                                });

                                describe('onError', function () {
                                    beforeEach(function () {
                                        onErrorSpy['description']();
                                    });

                                    it('put empty description on scope', function () {
                                        expect(scope.seo.description).toEqual('');
                                    });
                                });

                            });
                        });

                        describe('when default title is changed', function () {
                            describe('and title is undefined', function () {
                                beforeEach(function () {
                                    scope.seo.defaultTitle = 'changed';
                                    scope.seo.title = undefined;
                                    scope.$apply();
                                });

                                it('get title', function () {
                                    expect(ctxSpy['title'].fallback).toEqual('changed');
                                });
                            });

                            describe('and title is defined', function () {
                                beforeEach(function () {
                                    scope.seo.defaultTitle = 'changed';
                                    scope.seo.title = 'title';
                                    scope.$apply();
                                });

                                it('do nothing', function () {
                                    expect(ctxSpy['title']).toBeUndefined();
                                });
                            });
                        });

                        describe('when default title is undefined', function () {
                            beforeEach(function () {
                                scope.seo.defaultTitle = undefined;
                                scope.$apply();
                            });

                            it('do nothing', function () {
                                expect(ctxSpy['title']).toBeUndefined();
                            });
                        });
                    });
                });
            });
        });

        describe('SEOModalInstanceCtrl', function () {
            var modalInstance, modalInstanceCtrl, resultSpy, modalDismissed, location,
                i18nMessageWriterSpy, useCaseAdapterSpy, useCaseAdapterScopeSpy;

            beforeEach(inject(function ($location) {
                modalInstance = {
                    close: function (result) {
                        resultSpy = result;
                    },
                    dismiss: function () {
                        modalDismissed = true;
                    }
                };
                ctxSpy = [];
                onSuccessSpy = [];
                i18nMessageWriterSpy = function (ctx, onSuccess) {
                    ctxSpy[ctx.id] = ctx;
                    onSuccessSpy[ctx.id] = onSuccess;
                };
                useCaseAdapterSpy = function (scope) {
                    useCaseAdapterScopeSpy = scope;
                };
                scope.seo = {
                    defaultTitle: 'default title',
                    title: 'title',
                    description: 'description'
                };
                location = $location;
                location.path('/' + scope.locale + '/foo/bar');
                init();
            }));

            function init() {
                modalInstanceCtrl = new SEOModalInstanceCtrl(scope, modalInstance, i18nMessageWriterSpy, useCaseAdapterSpy, location);
            }

            it('seo values are copied to input map', function () {
                expect(scope.seo.input).toEqual({
                    defaultTitle: 'default title',
                    title: 'title',
                    description: 'description'
                });
            });

            it('input title should be empty when equal to default title', function () {
                scope.seo = {
                    defaultTitle: 'default title',
                    title: 'default title',
                    description: 'description'
                };
                init();

                expect(scope.seo.input.title).toEqual('');
            });

            describe('close action', function () {
                beforeEach(function () {
                    scope.close();
                });

                it('modal is dismissed', function () {
                    expect(modalDismissed).toEqual(true);
                });
            });

            describe('save action', function () {
                beforeEach(function () {
                    scope.seo.input.defaultTitle = 'default title';
                    scope.save();
                });

                describe('save default title', function () {
                    var ctx;

                    beforeEach(function () {
                        ctx = {
                            id: 'defaultTitle',
                            key: 'seo.title.default',
                            message: scope.seo.input.defaultTitle,
                            namespace: scope.namespace
                        };
                    });

                    it('feed context to i18n message writer', function () {
                        expect(ctxSpy['defaultTitle']).toEqual(ctx);
                    });

                    it('on success', function () {
                        expect(useCaseAdapterScopeSpy).toEqual(scope);
                    });
                });

                describe('save title', function () {
                    var ctx;

                    beforeEach(function () {
                        ctx = {
                            id: 'title',
                            key: '/foo/bar.seo.title',
                            message: scope.seo.input.title,
                            namespace: scope.namespace
                        };
                    });

                    it('feed context to i18n message writer', function () {
                        expect(ctxSpy['title']).toEqual(ctx);
                    });

                    it('on success', function () {
                        expect(useCaseAdapterScopeSpy).toEqual(scope);
                    });
                });

                describe('save description', function () {
                    var ctx;

                    beforeEach(function () {
                        ctx = {
                            id: 'description',
                            key: '/foo/bar.seo.description',
                            message: scope.seo.input.description,
                            namespace: scope.namespace
                        };
                    });

                    it('feed context to i18n message writer', function () {
                        expect(ctxSpy['description']).toEqual(ctx);
                    });

                    it('on success', function () {
                        expect(useCaseAdapterScopeSpy).toEqual(scope);
                    });
                });

                it('modal is closed', function () {
                    expect(resultSpy).toEqual({
                        defaultTitle: 'default title',
                        title: 'title',
                        description: 'description'
                    });
                });
            });

            it('do not save title when it is equal to default title', function () {
                scope.seo.input.defaultTitle = 'equal title';
                scope.seo.input.title = 'equal title';
                scope.save();

                expect(ctxSpy['title']).toBeUndefined();
            });
        });
    });
});
