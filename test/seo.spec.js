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

    describe('on route change', function () {
        beforeEach(function () {
            spyOn(seoSupport, 'resolve');
            $rootScope.$broadcast('$routeChangeStart', {params: {}});
        });

        it('seo values are resolved', function () {
            expect(seoSupport.resolve).toHaveBeenCalled();
        });
    });

    describe('seoSupport service', function () {
        var siteName, defaultTitle, pageTitle, pageDescription;

        describe('on resolve with default values', function () {
            var resolved;

            beforeEach(function () {
                siteName = defaultSiteName;
                defaultTitle = '';
                pageTitle = '';
                pageDescription = '';

                seoSupport.resolve({
                    success: function (seo) {
                        resolved = seo;
                    }
                });
            });

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

                it('title tag is added', function () {
                    var tag = head.find('title')[0];
                    expect(tag.innerText).toEqual(defaultSiteName);
                });

                it('description tag is not added', function () {
                    var tag = head.find('meta[name="description"]')[0];
                    expect(tag).toBeUndefined();
                });

                it('og description meta tag is not added', function () {
                    var tag = head.find('meta[property="og:description"]')[0];
                    expect(tag).toBeUndefined();
                });

                it('og title meta tag is not added', function () {
                    var tag = head.find('meta[property="og:title"]')[0];
                    expect(tag).toBeUndefined();
                });

                it('author meta tag is added', function () {
                    var tag = head.find('meta[name="author"]')[0];
                    expect(tag.content).toEqual(defaultSiteName);
                });

                it('og type meta tag is added', function () {
                    var tag = head.find('meta[property="og:type"]')[0];
                    expect(tag.content).toEqual('website');
                });

                it('og site_name meta tag is added', function () {
                    var tag = head.find('meta[property="og:site_name"]')[0];
                    expect(tag.content).toEqual(defaultSiteName);
                });

                it('og url meta tag is added', function () {
                    var tag = head.find('meta[property="og:url"]')[0];
                    expect(tag.content).toContain(path);
                });
            });
        });

        describe('on resolve with values', function () {
            beforeEach(function () {
                siteName = 'site name';
                defaultTitle = 'default title';
                pageTitle = 'page title';
                pageDescription = 'page description';

                i18n.updateSpy['seo.site.name'] = siteName;
                i18n.updateSpy['seo.title.default'] = defaultTitle;
                i18n.updateSpy[path + '.seo.title'] = pageTitle;
                i18n.updateSpy[path + '.seo.description'] = pageDescription;

                seoSupport.resolve();
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

                it('title tag is added', function () {
                    var tag = head.find('title')[0];
                    expect(tag.innerText).toEqual(pageTitle + ' | ' + siteName);
                });

                it('description tag is added', function () {
                    var tag = head.find('meta[name="description"]')[0];
                    expect(tag.content).toEqual(pageDescription);
                });

                it('og description meta tag is added', function () {
                    var tag = head.find('meta[property="og:description"]')[0];
                    expect(tag.content).toEqual(pageDescription);
                });

                it('og title meta tag is added', function () {
                    var tag = head.find('meta[property="og:title"]')[0];
                    expect(tag.content).toEqual(pageTitle);
                });

                it('author meta tag is added', function () {
                    var tag = head.find('meta[name="author"]')[0];
                    expect(tag.content).toEqual(siteName);
                });

                it('og type meta tag is added', function () {
                    var tag = head.find('meta[property="og:type"]')[0];
                    expect(tag.content).toEqual('website');
                });

                it('og site_name meta tag is added', function () {
                    var tag = head.find('meta[property="og:site_name"]')[0];
                    expect(tag.content).toEqual(siteName);
                });

                it('og url meta tag is added', function () {
                    var tag = head.find('meta[property="og:url"]')[0];
                    expect(tag.content).toContain(path);
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

                it('description tag is updated', function () {
                    var tag = head.find('meta[name="description"]')[0];
                    expect(tag.content).toEqual(pageDescription);
                });

                it('og description meta tag is updated', function () {
                    var tag = head.find('meta[property="og:description"]')[0];
                    expect(tag.content).toEqual(pageDescription);
                });

                it('og title meta tag is updated', function () {
                    var tag = head.find('meta[property="og:title"]')[0];
                    expect(tag.content).toEqual(pageTitle);
                });

                it('author meta tag is updated', function () {
                    var tag = head.find('meta[name="author"]')[0];
                    expect(tag.content).toEqual(siteName);
                });

                it('og type meta tag is updated', function () {
                    var tag = head.find('meta[property="og:type"]')[0];
                    expect(tag.content).toEqual('website');
                });

                it('og site_name meta tag is updated', function () {
                    var tag = head.find('meta[property="og:site_name"]')[0];
                    expect(tag.content).toEqual(siteName);
                });

                it('og url meta tag is updated', function () {
                    var tag = head.find('meta[property="og:url"]')[0];
                    expect(tag.content).toContain(path);
                });

                it('success callback is executed', function () {
                    expect(resolved).toBeTruthy();
                });
            });
        });

        describe('on update title tag', function () {
            beforeEach(function () {
                pageTitle = 'updated title';
                seoSupport.updateTitleTag(pageTitle);
                $rootScope.$digest();
            });

            it('title tag is updated', function () {
                var tag = head.find('title')[0];
                expect(tag.innerText).toEqual(pageTitle);
            });

            it('og title meta tag is updated', function () {
                var tag = head.find('meta[property="og:title"]')[0];
                expect(tag.content).toEqual(pageTitle);
            });
        });

        describe('on update description tag', function () {
            beforeEach(function () {
                pageDescription = 'updated description';
                seoSupport.updateDescriptionTag(pageDescription);
                $rootScope.$digest();
            });

            it('description tag is updated', function () {
                var tag = head.find('meta[name="description"]')[0];
                expect(tag.content).toEqual(pageDescription);
            });

            it('og description meta tag is updated', function () {
                var tag = head.find('meta[property="og:description"]')[0];
                expect(tag.content).toEqual(pageDescription);
            });
        });

        describe('on update image meta tag', function () {
            var url;

            beforeEach(function () {
                url = '/image/path';
                seoSupport.updateImageMetaTag(url);
                $rootScope.$digest();
            });

            it('og image meta tag is updated', function () {
                var tag = head.find('meta[property="og:image"]')[0];
                expect(tag.content).toEqual(url);
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
                            binarta.checkpoint.gateway.addPermission('video.config.update');
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

    describe('seoTitle directive', function () {
        var title, element, scope;

        beforeEach(function () {
            scope = $rootScope.$new();
            title = head.find('title')[0];
            element = angular.element('<div seo-title>{{var}}</div>');
        });

        describe('with no previous title set', function () {
            beforeEach(function () {
                $compile(element)(scope);
                scope.var = 'Page title';
                scope.$digest();
            });

            it('title element is updated', function () {
                expect(title.innerText).toEqual('Page title | ' + defaultSiteName);
            });

            describe('when element changes', function () {
                beforeEach(function () {
                    scope.var = 'changed title';
                    scope.$digest();
                });

                it('title is updated', function () {
                    expect(title.innerText).toEqual('changed title | ' + defaultSiteName);
                });
            });
        });

        describe('with a previous title', function () {
            beforeEach(function () {
                i18n.updateSpy[path + '.seo.title'] = 'previous title';
                seoSupport.resolve();
                $compile(element)(scope);
                scope.var = 'Page title';
                scope.$digest();
            });

            it('title element is not updated', function () {
                expect(title.innerText).toEqual('previous title | ' + defaultSiteName);
            });

            describe('when element changes', function () {
                beforeEach(function () {
                    scope.var = 'changed title';
                    scope.$digest();
                });

                it('title is not updated', function () {
                    expect(title.innerText).toEqual('previous title | ' + defaultSiteName);
                });
            });
        });
    });

    describe('seoDescription directive', function () {
        var description, element, scope, binTruncateSpy;

        beforeEach(inject(function (_binTruncateSpy_) {
            binTruncateSpy = _binTruncateSpy_;
            scope = $rootScope.$new();
            element = angular.element('<div seo-description>{{var}}</div>');
        }));

        describe('with no previous description set', function () {
            beforeEach(function () {
                $compile(element)(scope);
                scope.var = 'd';
                scope.$digest();
                description = head.find('meta[name="description"]')[0];
            });

            it('description tag is updated', function () {
                expect(binTruncateSpy).toHaveBeenCalledWith({
                    value: 'd',
                    length: 160
                });
                expect(description.content).toEqual('d');
            });

            describe('when element changes', function () {
                beforeEach(function () {
                    scope.var = 'changed description';
                    scope.$digest();
                });

                it('description tag is updated', function () {
                    expect(binTruncateSpy).toHaveBeenCalledWith({
                        value: 'changed description',
                        length: 160
                    });
                    expect(description.content).toEqual('changed description');
                });
            });
        });

        describe('with previous description', function () {
            beforeEach(function () {
                i18n.updateSpy[path + '.seo.description'] = 'previous description';
                seoSupport.resolve();
                $compile(element)(scope);
                scope.var = 'd';
                scope.$digest();
                description = head.find('meta[name="description"]')[0];
            });

            it('description tag is not updated', function () {
                expect(description.content).toEqual('previous description');
            });

            describe('when element changes', function () {
                beforeEach(function () {
                    scope.var = 'changed description';
                    scope.$digest();
                });

                it('description tag is not updated', function () {
                    expect(description.content).toEqual('previous description');
                });
            });
        });
    });

    describe('seoImage directive', function () {
        var tag, element, scope;

        beforeEach(function () {
            scope = $rootScope.$new();
            element = angular.element('<image src="{{var}}" seo-image />');
            $compile(element)(scope);
            scope.var = 'http://image-url.jpg/';
            scope.$digest();
            tag = head.find('meta[property="og:image"]')[0];
        });

        it('image meta tag is added', function () {
            expect(tag.content).toEqual('http://image-url.jpg/');
        });

        describe('when element changes', function () {
            beforeEach(function () {
                scope.var = 'http://another-url.jpg/';
                scope.$digest();
            });

            it('image meta tag is updated', function () {
                expect(tag.content).toEqual('http://another-url.jpg/');
            });
        });
    });
});
