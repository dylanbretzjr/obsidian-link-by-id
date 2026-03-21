import { App, Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo, TFile } from 'obsidian';
import LinkByID from './main';

export class LinkIdAutocomplete extends EditorSuggest<TFile> {
	plugin: LinkByID;

	constructor(app: App, plugin: LinkByID) {
		super(app);
		this.plugin = plugin;
	}

	// Determines if the suggester should trigger based on cursor position
	onTrigger(cursor: EditorPosition, editor: Editor, file: TFile): EditorSuggestTriggerInfo | null {
		if (!this.plugin.settings.enableLinkIdAutocomplete) return null;

		const triggerStr = this.plugin.settings.triggerString;
		if (!triggerStr) return null;

		const lineToCursor = editor.getLine(cursor.line).substring(0, cursor.ch);
		const lastTriggerIndex = lineToCursor.lastIndexOf(triggerStr);

		if (lastTriggerIndex !== -1) {
			const query = lineToCursor.substring(lastTriggerIndex + triggerStr.length);
			return {
				start: { line: cursor.line, ch: lastTriggerIndex },
				end: cursor,
				query: query
			};
		}

		return null;
	}

	// Filters the files based on the typed query
	getSuggestions(context: EditorSuggestContext): TFile[] {
		const query = context.query.toLowerCase();
		const allFiles = this.app.vault.getMarkdownFiles();

		return allFiles
			.filter(file => file.basename.toLowerCase().includes(query))
			.slice(0, 10); // Limit to 10 suggestions for performance
	}

	// Renders the suggestion in the popup UI
	renderSuggestion(file: TFile, el: HTMLElement): void {
		el.setText(file.basename);
	}

	// Handles the insertion when a file is selected
	selectSuggestion(file: TFile, evt: MouseEvent | KeyboardEvent): void {
		const { idPosition, idDelimiter } = this.plugin.settings;
		let extractedUid = file.basename;

		// Extract the UID based on settings
		if (idDelimiter && file.basename.includes(idDelimiter)) {
			const parts = file.basename.split(idDelimiter);
			extractedUid = (idPosition === 'start' ? parts.shift() : parts.pop()) ?? file.basename;
		}

		// Insert the resolved UID as an internal link
		if (this.context) {
			const editor = this.context.editor;
			const replacement = `[[${extractedUid}]]`;
			editor.replaceRange(replacement, this.context.start, this.context.end);
		}
	}
}
