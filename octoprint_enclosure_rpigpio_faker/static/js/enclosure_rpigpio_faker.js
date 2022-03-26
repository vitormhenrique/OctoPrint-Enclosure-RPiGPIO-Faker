/*
 * View model for OctoPrint-Enclosure-RPiGPIO-Faker
 *
 * Author: Vitor de Miranda Henrique
 * License: AGPLv3
 */
$(function () {

    var cleanInputIO = function (index_id) {
        return {
            index_id: index_id,
            label: "",
            gpio_pin:"",
            pull_resistor:"input_pull_up",
            event_trigger:"fall"
        }
    };

    var cleanOutputIO = function (index_id) {
        return {
            index_id: index_id,
            label: "",
            gpio_pin:"",
            active_low:true
        }
    };


    function InputIOEditorViewModel(parameters) {
        var self = this;

        self.isNew = ko.observable(false);
        self.index_id = ko.observable();
        self.label = ko.observable();
        self.gpio_pin = ko.observable();
        self.pull_resistor = ko.observable();
        self.event_trigger = ko.observable();
        
        self.rpi_input_ios = undefined;
        self.enclosureViewModel = undefined;


        self.validInput = ko.pureComputed(function () {
            return true;
        });

        self.fromIOData = function (data) {

            self.isNew(data === undefined);

            if (data === undefined) {
                var arrRelaysLength = self.rpi_input_ios().length;
                var nextIndex = arrRelaysLength == 0 ? 1 : self.rpi_input_ios()[arrRelaysLength - 1].index_id() + 1;
                // var testIndex = self.enclosureViewModel.get_uuid();
                data = cleanInputIO(nextIndex);
            } else {
                objIndex = self.rpi_input_ios().findIndex((obj => obj.index_id == data.index_id));
                data = ko.mapping.toJS(self.rpi_input_ios()[objIndex]);
            }

            self.index_id(data.index_id);
            self.label(data.label);
            self.gpio_pin(data.gpio_pin);
            self.pull_resistor(data.pull_resistor);
            self.event_trigger(data.event_trigger);

        };

        self.toInputIOData = function (data) {
            var _data = {
                index_id: self.index_id(),
                label: self.label(),
                gpio_pin: self.gpio_pin(),
                pull_resistor: self.pull_resistor(),
                event_trigger: self.event_trigger(),
            }

            return _data;
        };
        // end of InputIOEditorViewModel
    };

    function OutputIOEditorViewModel(parameters) {
        var self = this;

        self.isNew = ko.observable(false);

        self.index_id = ko.observable();
        self.label = ko.observable();
        self.gpio_pin = ko.observable();
        self.active_low = ko.observable();
        
        self.rpi_output_ios = undefined;
        self.enclosureViewModel = undefined;

        self.validInput = ko.pureComputed(function () {
            return true;
        });

        self.fromIOData = function (data) {

            self.isNew(data === undefined);

            if (data === undefined) {
                var arrRelaysLength = self.rpi_output_ios().length;
                var nextIndex = arrRelaysLength == 0 ? 1 : self.rpi_output_ios()[arrRelaysLength - 1].index_id() + 1;
                // var testIndex = self.enclosureViewModel.get_uuid();
                data = cleanOutputIO(nextIndex);
            } else {
                objIndex = self.rpi_output_ios().findIndex((obj => obj.index_id == data.index_id));
                data = ko.mapping.toJS(self.rpi_output_ios()[objIndex]);
            }

            self.index_id(data.index_id);
            self.label(data.label);
            self.gpio_pin(data.gpio_pin);
            self.active_low(data.active_low);
            
        };

        self.toIOData = function (data) {
            var _data = {
                index_id: self.index_id(),
                label: self.label(),
                gpio_pin: self.gpio_pin(),
                active_low: self.active_low(),
            }

            return _data;
        };
        // end of OutputIOEditorViewModel
    };


    function EnclosureRPiGPIOFakerViewModel(parameters) {
        var self = this;

        self.settingsViewModel = parameters[0];
        self.enclosureViewModel = parameters[1];

        self.rpi_input_ios = ko.observableArray();
        self.rpi_output_ios = ko.observableArray();
        
        
        self.settings_unsaved = ko.observable(false);

        self.onBeforeBinding = function () {
            self.rpi_input_ios(self.settingsViewModel.settings.plugins.enclosure_rpigpio_faker.rpi_input_ios())
            self.rpi_output_ios(self.settingsViewModel.settings.plugins.enclosure_rpigpio_faker.rpi_output_ios())
        };


        self.createInputIOEditor = function (data) {
            var inputEditor = new InputIOEditorViewModel();
            return inputEditor;
        };

        self.createOutputIOEditor = function (data) {
            var outputEditor = new OutputIOEditorViewModel();
            return outputEditor;
        };

        self.inputEditor = self.createInputIOEditor();
        self.inputEditor.rpi_input_ios = self.rpi_input_ios;
        // self.inputEditor.enclosureViewModel = self.enclosureViewModel;

        self.outputEditor = self.createOutputIOEditor();
        self.outputEditor.rpi_output_ios = self.rpi_output_ios;
        // self.outputEditor.enclosureViewModel = self.enclosureViewModel;

        self.removeInputIO = function (data) {
            self.rpi_input_ios.remove(data);
            self.settings_unsaved(true);
        }

        self.removeOutputIO = function (data) {
            self.rpi_output_ios.remove(data);
            self.settings_unsaved(true);
        }

        self.showInputIODialog = function (data) {

            self.inputEditor.fromIOData(data);

            var editDialog = $("#settings_input_io_edit_dialog");

            $('ul.nav-pills a[data-toggle="tab"]:first', editDialog).tab("show");
            editDialog.modal({
                minHeight: function () {
                    return Math.max($.fn.modal.defaults.maxHeight() - 80, 250);
                }
            }).css({
                width: 'auto',
                'margin-left': function () {
                    return -($(this).width());
                }
            });
        };

        self.showOutputIODialog = function (data) {

            self.outputEditor.fromIOData(data);

            var editDialog = $("#settings_output_io_edit_dialog");

            $('ul.nav-pills a[data-toggle="tab"]:first', editDialog).tab("show");
            editDialog.modal({
                minHeight: function () {
                    return Math.max($.fn.modal.defaults.maxHeight() - 80, 250);
                }
            }).css({
                width: 'auto',
                'margin-left': function () {
                    return -($(this).width());
                }
            });
        };

        self.addInputIO = function (callback) {
            var isNew = self.inputEditor.isNew();

            self.settings_unsaved(true);

            var input = ko.mapping.fromJS(self.inputEditor.toIOData());

            if (isNew) {
                self.rpi_input_ios.push(input);
                // if (input.input_type() == 'input'){
                //     self.enclosureViewModel.enclosureInputs.push(input)
                // } else {
                //     self.enclosureViewModel.enclosureOutputs.push(input)
                // }
                
            } else {
                objIndex = self.rpi_input_ios().findIndex((obj => obj.index_id() == input.index_id()));
                var _old_input = self.rpi_input_ios()[objIndex];
                self.rpi_input_ios.replace(_old_input, input);
            }

            if (callback !== undefined) {
                callback();
            }
        };

        self.addOutputIO = function (callback) {
            var isNew = self.outputEditor.isNew();

            self.settings_unsaved(true);

            var input = ko.mapping.fromJS(self.outputEditor.toIOData());

            if (isNew) {
                self.rpi_output_ios.push(input);                
            } else {
                objIndex = self.rpi_output_ios().findIndex((obj => obj.index_id() == input.index_id()));
                var _old_input = self.rpi_output_ios()[objIndex];
                self.rpi_output_ios.replace(_old_input, input);
            }

            if (callback !== undefined) {
                callback();
            }
        };

        self.confirmEditInputIO = function () {

            if (self.inputEditor.validInput()) {
                var callback = function () {
                    $("#settings_input_io_edit_dialog").modal("hide");
                };

                self.addInputIO(callback);
            }
        };

        self.confirmEditOutputIO = function () {

            if (self.outputEditor.validInput()) {
                var callback = function () {
                    $("#settings_output_io_edit_dialog").modal("hide");
                };

                self.addOutputIO(callback);
            }
        };

    }

    OCTOPRINT_VIEWMODELS.push({
        construct: EnclosureRPiGPIOFakerViewModel,
        dependencies: ["settingsViewModel"],
        elements: ["#settings_plugin_enclosure_rpigpio_faker"]
    });
});
