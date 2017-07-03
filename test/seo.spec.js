describe('seo', function () {
    var $rootScope, $location, $compile, seoSupport, binarta, i18n, config, head,
        path = '/unlocalized/path',
        defaultSiteName = 'Namespace';

    beforeEach(module('seo'));

    beforeEach(inject(function (_$rootScope_, _$location_, _$compile_, _seoSupport_, _binarta_, _i18n_, _config_, $document) {
        $rootScope = _$rootScope_;
        $location = _$location_;
        $compile = _$compile_;
        seoSupport = _seoSupport_;
        binarta = _binarta_;
        i18n = _i18n_;
        config = _config_;
        head = $document.find('head');
        $location.path(path);
        triggerBinartaSchedule();
    }));

    function triggerBinartaSchedule() {
        binarta.application.adhesiveReading.read('-');
    }

    describe('seoSupport service', function () {
        var siteName, defaultTitle, pageTitle, pageDescription;

        describe('on getSEOValues with default values', function () {
            var successSpy;

            beforeEach(inject(function () {
                siteName = defaultSiteName;
                defaultTitle = '';
                pageTitle = '';
                pageDescription = '';
                successSpy = jasmine.createSpy('spy');
                seoSupport.getSEOValues({success: successSpy});
            }));

            it('default message are resolved', function () {
                expect(i18n.resolveSpy['seo.site.name']).toEqual(siteName);
                expect(i18n.resolveSpy['seo.title.default']).toEqual(defaultTitle);
                expect(i18n.resolveSpy[path + '.seo.title']).toEqual(pageTitle);
                expect(i18n.resolveSpy[path + '.seo.description']).toEqual(pageDescription);
            });

            describe('on success', function () {
                beforeEach(function () {
                    $rootScope.$digest();
                });

                it('seo values are available', function () {
                    expect(seoSupport.seo).toEqual({
                        siteName: siteName,
                        defaultTitle: defaultTitle,
                        title: pageTitle,
                        description: pageDescription
                    });
                });

                it('success callback is executed', function () {
                    expect(successSpy).toHaveBeenCalledWith(seoSupport.seo);
                });
            });
        });

        describe('on getSEOValues with values', function () {
            beforeEach(function () {
                siteName = 'site name';
                defaultTitle = 'default title';
                pageTitle = 'page title';
                pageDescription = 'page description';

                i18n.updateSpy['seo.site.name'] = siteName;
                i18n.updateSpy['seo.title.default'] = defaultTitle;
                i18n.updateSpy[path + '.seo.title'] = pageTitle;
                i18n.updateSpy[path + '.seo.description'] = pageDescription;

                seoSupport.getSEOValues();
            });

            it('message are resolved', function () {
                expect(i18n.resolveSpy['seo.site.name']).toEqual(siteName);
                expect(i18n.resolveSpy['seo.title.default']).toEqual(defaultTitle);
                expect(i18n.resolveSpy[path + '.seo.title']).toEqual(pageTitle);
                expect(i18n.resolveSpy[path + '.seo.description']).toEqual(pageDescription);
            });

            describe('on success', function () {
                beforeEach(function () {
                    $rootScope.$digest();
                });

                it('seo values are available', function () {
                    expect(seoSupport.seo).toEqual({
                        siteName: siteName,
                        defaultTitle: defaultTitle,
                        title: pageTitle,
                        description: pageDescription
                    });
                });
            });
        });

        describe('on update', function () {
            var resolved;

            beforeEach(function () {
                siteName = 'new site name';
                defaultTitle = 'new default title';
                pageTitle = 'new page title';
                pageDescription = 'new page description';

                seoSupport.update({
                    siteName: siteName,
                    defaultTitle: defaultTitle,
                    title: pageTitle,
                    description: pageDescription,
                    pageCode: path,
                    success: function () {
                        resolved = true;
                    }
                });
            });

            it('messages are translated', function () {
                expect(i18n.updateSpy['seo.site.name']).toEqual(siteName);
                expect(i18n.updateSpy['seo.title.default']).toEqual(defaultTitle);
                expect(i18n.updateSpy[path + '.seo.title']).toEqual(pageTitle);
                expect(i18n.updateSpy[path + '.seo.description']).toEqual(pageDescription);
            });

            describe('on success', function () {
                beforeEach(function () {
                    $rootScope.$digest();
                });

                it('seo values are available', function () {
                    expect(seoSupport.seo).toEqual({
                        siteName: siteName,
                        defaultTitle: defaultTitle,
                        title: pageTitle,
                        description: pageDescription
                    });
                });

                it('title tag is updated', function () {
                    var tag = head.find('title')[0];
                    expect(tag.innerText).toEqual(pageTitle + ' | ' + siteName);
                });

                it('success callback is executed', function () {
                    expect(resolved).toBeTruthy();
                });
            });
        });

        it('apple icon is added to head', function () {
            var appleIcon = head.find('link[rel="apple-touch-icon"]')[0];
            expect(appleIcon.sizes.toString()).toEqual('180x180');
            expect(appleIcon.href).toContain(config.awsPath + 'favicon.img?height=180');
        });

        it('favicons are added to head', function () {
            var favicons = head.find('link[rel="icon"]');
            expect(favicons[0].sizes.toString()).toEqual('32x32');
            expect(favicons[0].href).toContain(config.awsPath + 'favicon.img?height=32');
            expect(favicons[1].sizes.toString()).toEqual('16x16');
            expect(favicons[1].href).toContain(config.awsPath + 'favicon.img?height=16');
        });

    });

    describe('seoSupport directive', function () {
        var element, editModeRenderer, scope;

        beforeEach(inject(function (_editModeRenderer_) {
            editModeRenderer = _editModeRenderer_;
            element = angular.element('<div seo-support></div>');
            $compile(element)($rootScope.$new());
            scope = element.scope();
        }));

        describe('when user has no seo.edit permission', function () {
            describe('on open', function () {
                beforeEach(function () {
                    scope.open();
                });

                it('edit mode renderer is opened', function () {
                    expect(editModeRenderer.open).toHaveBeenCalledWith({
                        templateUrl: 'bin-seo-edit.html',
                        scope: jasmine.any(Object)
                    });
                });

                describe('with edit mode scope', function () {
                    var editScope;

                    beforeEach(function () {
                        editScope = editModeRenderer.open.calls.mostRecent().args[0].scope;
                    });

                    it('is in unavailable state', function () {
                        expect(editScope.state.name).toEqual('unavailable');
                    });

                    it('on close', function () {
                        editScope.close();
                        expect(editModeRenderer.close).toHaveBeenCalled();
                    });
                });
            });
        });

        describe('when user has seo.edit permission', function () {
            beforeEach(function () {
                binarta.checkpoint.gateway.addPermission('seo.edit');
                binarta.checkpoint.registrationForm.submit({username: 'u', password: 'p'});
            });

            describe('on open', function () {
                beforeEach(function () {
                    scope.open();
                });

                it('edit mode renderer is opened', function () {
                    expect(editModeRenderer.open).toHaveBeenCalledWith({
                        templateUrl: 'bin-seo-edit.html',
                        scope: jasmine.any(Object)
                    });
                });

                describe('with edit mode scope', function () {
                    var editScope;

                    beforeEach(function () {
                        editScope = editModeRenderer.open.calls.mostRecent().args[0].scope;
                    });

                    it('is in seo state', function () {
                        expect(editScope.state.name).toEqual('seo');
                    });

                    describe('with SEO values', function () {
                        beforeEach(function () {
                            scope.$digest();
                        });

                        it('SEO values are available', function () {
                            expect(editScope.state.seo).toEqual({
                                siteName: 'Namespace',
                                defaultTitle: '',
                                title: '',
                                description: '',
                                pageCode: '/unlocalized/path'
                            });
                        });

                        describe('on save', function () {
                            beforeEach(function () {
                                spyOn(seoSupport, 'update');
                                editScope.state.seo.title = 'new';
                                editScope.save();
                            });

                            it('is working', function () {
                                expect(editScope.working).toBeTruthy();
                            });

                            it('is updated', function () {
                                expect(seoSupport.update).toHaveBeenCalledWith({
                                    siteName: 'Namespace',
                                    defaultTitle: '',
                                    title: 'new',
                                    description: '',
                                    pageCode: '/unlocalized/path',
                                    success: jasmine.any(Function)
                                });
                            });

                            describe('on update success', function () {
                                beforeEach(function () {
                                    seoSupport.update.calls.mostRecent().args[0].success();
                                });

                                it('edit mode renderer is closed', function () {
                                    expect(editModeRenderer.close).toHaveBeenCalled();
                                });
                            });
                        });
                    });

                    describe('on switch state', function () {
                        beforeEach(function () {
                            editScope.switchState();
                        });

                        it('is in favicon state', function () {
                            expect(editScope.state.name).toEqual('favicon');
                        });

                        it('isPermitted is on state', function () {
                            expect(editScope.state.isPermitted).toBeFalsy();
                        });

                        describe('on switch state again', function () {
                            beforeEach(function () {
                                editScope.switchState();
                            });

                            it('is back in seo state', function () {
                                expect(editScope.state.name).toEqual('seo');
                            });
                        });
                    });

                    describe('and user has favicon.upload permission', function () {
                        beforeEach(function () {
                            binarta.checkpoint.gateway.addPermission('favicon.upload');
                            binarta.checkpoint.profile.refresh();
                        });

                        describe('on switch state', function () {
                            beforeEach(function () {
                                editScope.switchState();
                            });

                            it('isPermitted is on state', function () {
                                expect(editScope.state.isPermitted).toBeTruthy();
                            });
                        });
                    });
                });
            });
        });
    });
});
