import {Notice, Plugin} from 'obsidian';
import {DEFAULT_SETTINGS, MyPluginSettings} from "./settings";

// Remember to rename these classes and interfaces!

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		this.registerDomEvent(document, 'mousedown', (evt: MouseEvent) => {
			const target = evt.target as HTMLElement;

			// Capture the link element in Reading, Live Preview, and Source modes
			const linkEl = target.closest('.internal-link, .cm-underline, .cm-hmd-internal-link') as HTMLElement;

			if (!linkEl) return;

			// 1. Prevent the default editor/browser behavior
			evt.preventDefault();
			evt.stopPropagation();

			// 2. Extract the text to use for both searching and opening
			const linkText = linkEl.innerText;

			// 3. Trigger Global Search
			const searchPlugin = (this.app as any).internalPlugins.getPluginById('global-search');
			if (searchPlugin && searchPlugin.enabled) {
				searchPlugin.instance.openGlobalSearch(linkText);
				new Notice(`Searching vault for: "${linkText}"`);
			}

			// 4. Manually open the link
    		// The third argument (evt.metaKey) handles opening in a new tab if Cmd is held
			this.app.workspace.openLinkText(linkText, "", evt.metaKey);
			
		}, true);
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<MyPluginSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
