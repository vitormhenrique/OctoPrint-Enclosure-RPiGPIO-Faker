# coding=utf-8
from __future__ import absolute_import

# (Don't forget to remove me)
# This is a basic skeleton for your plugin's __init__.py. You probably want to adjust the class name of your plugin
# as well as the plugin mixins it's subclassing from. This is really just a basic skeleton to get you started,
# defining your plugin as a template plugin, settings and asset plugin. Feel free to add or remove mixins
# as necessary.
#
# Take a look at the documentation on what other plugin mixins are available.

import octoprint.plugin
from enum import Enum

class IOType(Enum):
    INPUT = 'input'
    OUTPUT  = 'output'


class EnclosurePluginRPiGPIOFakerPlugin(octoprint.plugin.StartupPlugin,
                                        octoprint.plugin.SettingsPlugin,
                                        octoprint.plugin.AssetPlugin,
                                        octoprint.plugin.TemplatePlugin
                                        ):

    # ~~ StartupPlugin

    def on_startup(self, host, port):
        self.rpi_ios = self._settings.get(["rpi_ios"])

        enclosure_helpers = self._plugin_manager.get_helpers("enclosure")
        self._logger.info("Registering plugin with Enclosure")
        enclosure_helpers['register_plugin'](self)


    # ~~ TemplatePlugin

    def get_template_configs(self):
        return [
            dict(
                type="settings",
                template="enclosure_rpigpio_settings.jinja2",
                custom_bindings=True
            )
        ]

    # ~~ SettingsPlugin mixin

    def get_settings_defaults(self):
        return {
            'rpi_ios':[]
        }

    def on_settings_save(self, data):
        self._logger.info(f"Saving settings from plugin {data}")
        old_rpi_ios = self._settings.get(["rpi_ios"])
        octoprint.plugin.SettingsPlugin.on_settings_save(self, data)
        new_rpi_ios = self._settings.get(["rpi_ios"])

    # ~~ AssetPlugin mixin

    def get_assets(self):
        # Define your plugin's asset files to automatically include in the
        # core UI here.
        return {
            "js": ["js/enclosure_rpigpio_faker.js"],
            "css": ["css/enclosure_rpigpio_faker.css"],
            "less": ["less/enclosure_rpigpio_faker.less"]
        }

    # ~~ Softwareupdate hook

    def get_update_information(self):
        # Define the configuration for your plugin to use with the Software Update
        # Plugin here. See https://docs.octoprint.org/en/master/bundledplugins/softwareupdate.html
        # for details.
        return {
            "enclosure_rpigpio_faker": {
                "displayName": "Enclosure RPi GPIO Faker Plugin",
                "displayVersion": self._plugin_version,

                # version check: github repository
                "type": "github_release",
                "user": "vitormhenrique",
                "repo": "OctoPrint-Enclosure-RPiGPIO-Faker",
                "current": self._plugin_version,

                # update method: pip
                "pip": "https://github.com/vitormhenrique/OctoPrint-Enclosure-RPiGPIO-Faker/archive/{target_version}.zip",
            }
        }


__plugin_name__ = "Enclosure RPiGPIO Faker"
__plugin_pythoncompat__ = ">=3,<4"


def __plugin_load__():
    global __plugin_implementation__
    __plugin_implementation__ = EnclosurePluginRPiGPIOFakerPlugin()

    global __plugin_hooks__
    __plugin_hooks__ = {
        "octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
    }
