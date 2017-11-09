describe('seo', function () {
    var $rootScope, $location, $compile, seoSupport, binarta, i18n, config, head, editModeRenderer, editMode,
        path = '/unlocalized/path',
        defaultSiteName = 'Namespace';

    beforeEach(module('binartajs-angular1-spec'));
    beforeEach(module('seo'));

    beforeEach(inject(function (_$rootScope_, _$location_, _$compile_, _seoSupport_, _binarta_, _i18n_, _config_, $document, _editModeRenderer_, _editMode_) {
        $rootScope = _$rootScope_;
        $location = _$location_;
        $compile = _$compile_;
        seoSupport = _seoSupport_;
        binarta = _binarta_;
        i18n = _i18n_;
        config = _config_;
        head = $document.find('head');
        $location.path(path);
        editModeRenderer = _editModeRenderer_;
        editMode = _editMode_;
        triggerBinartaSchedule();
    }));

    function triggerBinartaSchedule() {
        binarta.application.adhesiveReading.read('-');
    }

    describe('on route change', function () {
        beforeEach(function () {
            $rootScope.$broadcast('$routeChangeStart', {params: {}});
        });

        it('canonical link is added', function () {
            var tag = head.find('link[rel="canonical"]')[0];
            expect(tag.href).toContain(path);
        });

        it('on path change, update canonical link', function () {
            $location.path('/new/path');
            $rootScope.$broadcast('$routeChangeStart', {params: {}});
            var tag = head.find('link[rel="canonical"]')[0];
            expect(tag.href).toContain('/new/path');
        });
    });

    describe('seoSupport service', function () {
        var siteName, defaultTitle, pageTitle, pageDescription;

        describe('on resolve with default values', function () {
            beforeEach(function () {
                siteName = defaultSiteName;
                defaultTitle = '';
                pageTitle = '';
                pageDescription = '';
                $rootScope.$broadcast('$routeChangeStart', {params: {}});
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

                $rootScope.$broadcast('$routeChangeStart', {params: {}});
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
            expect(appleIcon.href).toContain('image/' + config.namespace + '/favicon.img?height=180');
        });

        it('favicons are added to head', function () {
            var favicons = head.find('link[rel="icon"]');
            expect(favicons[0].sizes.toString()).toEqual('32x32');
            expect(favicons[0].href).toContain('image/' + config.namespace + '/favicon.img?height=32');
            expect(favicons[1].sizes.toString()).toEqual('16x16');
            expect(favicons[1].href).toContain('image/' + config.namespace + '/favicon.img?height=16');
        });

        describe('subscribe to seo value changes', function () {
            var listener;

            beforeEach(function () {
                listener = jasmine.createSpy('spy');
                seoSupport.subscribe(listener);
            });

            describe('when seo values are retrieved', function () {
                beforeEach(function () {
                    seoSupport.getSEOValues();
                    $rootScope.$digest();
                });

                it('listener is called', function () {
                    expect(listener).toHaveBeenCalledWith({
                        siteName: 'Namespace',
                        defaultTitle: '',
                        title: '',
                        description: ''
                    });
                });
            });

            describe('on update', function () {
                beforeEach(function () {
                    seoSupport.update({
                        siteName: 'Namespace',
                        defaultTitle: '',
                        title: 'new',
                        description: ''
                    });
                    $rootScope.$digest();
                });

                it('listener is called with updated values', function () {
                    expect(listener).toHaveBeenCalledWith({
                        siteName: 'Namespace',
                        defaultTitle: '',
                        title: 'new',
                        description: ''
                    });
                });
            });

            describe('when listener is unsubscribed', function () {
                beforeEach(function () {
                    listener.calls.reset();
                    seoSupport.unsubscribe(listener);
                });

                describe('on update', function () {
                    beforeEach(function () {
                        seoSupport.update({
                            siteName: 'Namespace',
                            defaultTitle: '',
                            title: 'update',
                            description: ''
                        });
                        $rootScope.$digest();
                    });

                    it('listener is not called with updated values', function () {
                        expect(listener).not.toHaveBeenCalled();
                    });
                });
            });
        });

        describe('on open', function () {
            describe('when user has no seo.edit permission', function () {
                beforeEach(function () {
                    seoSupport.open();
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

            describe('when user has seo.edit permission', function () {
                beforeEach(function () {
                    binarta.checkpoint.gateway.addPermission('seo.edit');
                    binarta.checkpoint.registrationForm.submit({username: 'u', password: 'p'});
                    seoSupport.open();
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
                            $rootScope.$digest();
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

    describe('seoSupport directive', function () {
        var element, scope;

        beforeEach(function () {
            element = angular.element('<div seo-support></div>');
            $compile(element)($rootScope.$new());
            scope = element.scope();
            spyOn(seoSupport, 'open');
        });

        it('on open', function () {
            scope.open();
            expect(seoSupport.open).toHaveBeenCalled();
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
                seoSupport.updateTags();
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
                seoSupport.updateTags();
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

    describe('binSiteName component', function () {
        var $ctrl, element;

        beforeEach(inject(function ($componentController) {
            spyOn(seoSupport, 'subscribe');
            spyOn(seoSupport, 'unsubscribe');
            spyOn(seoSupport, 'open');
            element = 'element';
            $ctrl = $componentController('binSiteName', {$element: element});
            $ctrl.$onInit();
        }));

        it('subscribe listener', function () {
            expect(seoSupport.subscribe).toHaveBeenCalled();
        });

        it('edit mode is bound', function () {
            expect(editMode.bindEvent).toHaveBeenCalledWith({
                scope: jasmine.any(Object),
                element: element,
                permission: 'i18n.message.add',
                onClick: jasmine.any(Function)
            });
        });

        describe('on open', function () {
            beforeEach(function () {
                editMode.bindEvent.calls.mostRecent().args[0].onClick();
            });

            it('seoSupport is opened with singleField option', function () {
                expect(seoSupport.open).toHaveBeenCalledWith({
                    editSingleField: 'siteName'
                });
            });
        });

        describe('when listener is executed', function () {
            beforeEach(function () {
                seoSupport.subscribe.calls.mostRecent().args[0]({
                    siteName: 'name'
                });
            });

            it('value on ctrl is updated', function () {
                expect($ctrl.siteName).toEqual('name');
            });
        });

        it('on destroy', function () {
            $ctrl.$onDestroy();
            expect(seoSupport.unsubscribe).toHaveBeenCalledWith(seoSupport.subscribe.calls.mostRecent().args[0]);
        });
    });

    describe('binSiteDefaultTitle component', function () {
        var $ctrl, element;

        beforeEach(inject(function ($componentController) {
            spyOn(seoSupport, 'subscribe');
            spyOn(seoSupport, 'unsubscribe');
            spyOn(seoSupport, 'open');
            element = 'element';
            $ctrl = $componentController('binSiteDefaultTitle', {$element: element});
            $ctrl.$onInit();
        }));

        it('subscribe listener', function () {
            expect(seoSupport.subscribe).toHaveBeenCalled();
        });

        it('edit mode is bound', function () {
            expect(editMode.bindEvent).toHaveBeenCalledWith({
                scope: jasmine.any(Object),
                element: element,
                permission: 'i18n.message.add',
                onClick: jasmine.any(Function)
            });
        });

        describe('on open', function () {
            beforeEach(function () {
                editMode.bindEvent.calls.mostRecent().args[0].onClick();
            });

            it('seoSupport is opened with singleField option', function () {
                expect(seoSupport.open).toHaveBeenCalledWith({
                    editSingleField: 'defaultTitle'
                });
            });
        });

        describe('when listener is executed', function () {
            beforeEach(function () {
                seoSupport.subscribe.calls.mostRecent().args[0]({
                    defaultTitle: 'title'
                });
            });

            it('value on ctrl is updated', function () {
                expect($ctrl.defaultTitle).toEqual('title');
            });
        });

        it('on destroy', function () {
            $ctrl.$onDestroy();
            expect(seoSupport.unsubscribe).toHaveBeenCalledWith(seoSupport.subscribe.calls.mostRecent().args[0]);
        });
    });
});
