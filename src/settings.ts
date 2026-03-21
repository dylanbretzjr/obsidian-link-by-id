import { App, PluginSettingTab, Setting } from 'obsidian';
import LinkAsSearch from './main';

export interface LinkAsSearchSettings {
	searchOnClick: boolean;
	hideUnresolvedLinkStyling: boolean;
}

export const DEFAULT_SETTINGS: LinkAsSearchSettings = {
	searchOnClick: false,
	hideUnresolvedLinkStyling: false
}

export class LinkAsSearchSettingTab extends PluginSettingTab {
	plugin: LinkAsSearch;

	constructor(app: App, plugin: LinkAsSearch) {
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
	}
}
