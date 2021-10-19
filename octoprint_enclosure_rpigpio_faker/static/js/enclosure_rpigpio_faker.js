/*
 * View model for OctoPrint-Enclosure-RPiGPIO-Faker
 *
 * Author: Vitor de Miranda Henrique
 * License: AGPLv3
 */
$(function () {

    var cleanIO = function (index_id) {
        return {
            index_id: index_id,
            label: "",
            input_type: "input",
        }
    };


    function IOEditorViewModel(parameters) {
        var self = this;

        self.isNew = ko.observable(false);
        self.index_id = ko.observable();
        self.label = ko.observable();
        self.input_type = ko.observable();

        self.rpi_ios = undefined;


        self.validInput = ko.pureComputed(function () {
            return true;
        });

        self.fromIOData = function (data) {

            self.isNew(data === undefined);

            if (data === undefined) {
                var arrRelaysLength = self.rpi_ios().length;
                var nextIndex = arrRelaysLength == 0 ? 1 : self.rpi_ios()[arrRelaysLength - 1].index_id() + 1;
                data = cleanIO(nextIndex);
            } else {
                objIndex = self.rpi_ios().findIndex((obj => obj.index_id == data.index_id));
                data = ko.mapping.toJS(self.rpi_ios()[objIndex]);
            }

            self.index_id(data.index_id);
            self.label(data.label);
            self.input_type(data.input_type);

        };

        self.toIOData = function (data) {
            var output_data = {
                index_id: self.index_id(),
                label: self.label(),
                input_type: self.input_type(),
            }

            return output_data;
        };
        // end of IOEditorViewModel
    };


    function EnclosureRPiGPIOFakerViewModel(parameters) {
        var self = this;

        self.settingsViewModel = parameters[0];
        self.rpi_ios = ko.observableArray();
        
        
        self.settings_unsaved = ko.observable(false);

        self.onBeforeBinding = function () {
            self.rpi_ios(self.settingsViewModel.settings.plugins.enclosure_rpigpio_faker.rpi_ios())
        };


        self.createIOEditor = function (data) {
            var inputEditor = new IOEditorViewModel();
            return inputEditor;
        };

        self.inputEditor = self.createIOEditor();
        self.inputEditor.rpi_ios = self.rpi_ios;

        self.removeIO = function (data) {
            self.rpi_ios.remove(data);
            self.settings_unsaved(true);
        }

        self.showIODialog = function (data) {

            self.inputEditor.fromIOData(data);

            var editDialog = $("#settings_io_edit_dialog");

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

        self.addIO = function (callback) {
            var isNew = self.inputEditor.isNew();

            self.settings_unsaved(true);

            var input = ko.mapping.fromJS(self.inputEditor.toIOData());

            if (isNew) {
                self.rpi_ios.push(input);
            } else {
                objIndex = self.rpi_ios().findIndex((obj => obj.index_id() == input.index_id()));
                var _old_input = self.rpi_ios()[objIndex];
                self.rpi_ios.replace(_old_input, input);
            }

            if (callback !== undefined) {
                callback();
            }
        };

        self.confirmEditIO = function () {

            if (self.inputEditor.validInput()) {
                var callback = function () {
                    $("#settings_io_edit_dialog").modal("hide");
                };

                self.addIO(callback);
            }
        };

    }

    /* view model class, parameters for constructor, container to bind to
     * Please see http://docs.octoprint.org/en/master/plugins/viewmodels.html#registering-custom-viewmodels for more details
     * and a full list of the available options.
     */
    OCTOPRINT_VIEWMODELS.push({
        construct: EnclosureRPiGPIOFakerViewModel,
        dependencies: ["settingsViewModel"],
        elements: ["#settings_plugin_enclosure_rpigpio_faker"]
    });
});
