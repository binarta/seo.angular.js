angular.module('toggle.edit.mode', [])
    .service('editModeRenderer', function () {
        this.open = jasmine.createSpy('open');
        this.close = jasmine.createSpy('close');
    });