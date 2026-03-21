import { App, PluginSettingTab, Setting } from 'obsidian';
import LinkByID from './main';

export interface LinkByIDSettings {
	searchOnClick: boolean;
	hideUnresolvedLinkStyling: boolean;
	enableLinkIdAutocomplete: boolean;
	triggerString: string;
	idDelimiter: string;
	idPosition: 'start' | 'end';
}

export const DEFAULT_SETTINGS: LinkByIDSettings = {
	searchOnClick: false,
	hideUnresolvedLinkStyling: false,
	enableLinkIdAutocomplete: false,
	triggerString: '@@',
	idDelimiter: '-',
	idPosition: 'start'
}

export class LinkByIDSettingTab extends PluginSettingTab {
	plugin: LinkByID;

	constructor(app: App, plugin: LinkByID) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Search on click (backlink view)')
			.setDesc('Clicking on an internal link opens the Search panel and searches the vault for the link target.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.searchOnClick)
				.onChange(async (value) => {
					this.plugin.settings.searchOnClick = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Hide unresolved link styling')
			.setDesc('Removes the dimmed effect from all unresolved links.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.hideUnresolvedLinkStyling)
				.onChange(async (value) => {
					this.plugin.settings.hideUnresolvedLinkStyling = value;
					await this.plugin.saveSettings();
					this.plugin.toggleUnresolvedClass(); 
				}));

		containerEl.createEl('h3', {text: 'Link ID autocomplete'});

		let triggerSetting: Setting;
		let delimiterSetting: Setting;
		let positionSetting: Setting;

		const toggleSubSettingsVisibility = (enabled: boolean) => {
			const displayState = enabled ? '' : 'none';

			triggerSetting.settingEl.style.display = displayState;
			delimiterSetting.settingEl.style.display = displayState;
			positionSetting.settingEl.style.display = displayState;
		};

		new Setting(containerEl)
			.setName('Enable link ID autocomplete')
			.setDesc('Toggles the custom link ID autocompletion on or off.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableLinkIdAutocomplete)
				.onChange(async (value) => {
					this.plugin.settings.enableLinkIdAutocomplete = value;
					await this.plugin.saveSettings();

					toggleSubSettingsVisibility(value);
				}));

		triggerSetting = new Setting(containerEl)
			.setName('Trigger string')
			.setDesc('The character sequence that activates the link ID autocompletion. Avoid using markdown syntactical elements, e.g., `_`, `*`, `>`, or `[`')
			.addText(text => text
				.setPlaceholder('@@')
				.setValue(this.plugin.settings.triggerString)
				.onChange(async (value) => {
					this.plugin.settings.triggerString = value || '@@';
					await this.plugin.saveSettings();
				}));

		delimiterSetting = new Setting(containerEl)
			.setName('ID delimiter')
			.setDesc('The character(s) separating the ID from the rest of the filename. Must not be a character used in the ID itself.')
			.addText(text => text
				.setPlaceholder('-')
				.setValue(this.plugin.settings.idDelimiter)
				.onChange(async (value) => {
					this.plugin.settings.idDelimiter = value || '-';
					await this.plugin.saveSettings();
				}));

		positionSetting = new Setting(containerEl)
			.setName('ID position')
			.setDesc('Where the ID is located in your filenames.')
			.addDropdown(dropdown => dropdown
				.addOption('start', 'Start of filename')
				.addOption('end', 'End of filename')
				.setValue(this.plugin.settings.idPosition)
				.onChange(async (value: 'start' | 'end') => {
					this.plugin.settings.idPosition = value;
					await this.plugin.saveSettings();
				}));

		toggleSubSettingsVisibility(this.plugin.settings.enableLinkIdAutocomplete);
	}
}
