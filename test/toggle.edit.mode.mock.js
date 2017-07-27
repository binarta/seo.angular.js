angular.module('toggle.edit.mode', [])
    .service('editModeRenderer', function () {
        this.open = jasmine.createSpy('open');
        this.close = jasmine.createSpy('close');
    })
    .service('editMode', function () {
        this.bindEvent = jasmine.createSpy('bindEvent');
    });