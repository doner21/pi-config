import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

const WORDMARK = "piNen";
const SUBTITLE = "warm terminal intelligence";
const RESET = "\x1b[0m";

function truecolor(r: number, g: number, b: number, text: string): string {
	return `\x1b[38;2;${r};${g};${b}m${text}${RESET}`;
}

function warmGradient(text: string): string {
	const last = Math.max(1, text.length - 1);
	let out = "";

	for (let index = 0; index < text.length; index++) {
		const char = text[index];
		if (char === " ") {
			out += char;
			continue;
		}

		const t = index / last;
		const r = Math.round(255 - 18 * t);
		const g = Math.round(214 - 100 * t);
		const b = Math.round(74 - 58 * t);
		out += truecolor(r, g, b, char);
	}

	return out;
}

function centerStyled(styled: string, plainWidth: number, width: number): string {
	const left = Math.max(0, Math.floor((width - plainWidth) / 2));
	return " ".repeat(left) + styled;
}

export function stripAnsi(text: string): string {
	return text.replace(/\x1b\[[0-9;]*m/g, "");
}

export function renderHeader(width: number): string[] {
	const longest = Math.max(WORDMARK.length, SUBTITLE.length);
	const safeWidth = Math.max(longest, Math.floor(width));
	return [
		"",
		centerStyled(warmGradient(WORDMARK), WORDMARK.length, safeWidth),
		centerStyled(truecolor(140, 140, 140, SUBTITLE), SUBTITLE.length, safeWidth),
		"",
	];
}

function install(ctx: ExtensionContext): void {
	if (ctx.mode !== "tui") return;

	ctx.ui.setHeader((_tui, _theme) => ({
		render: renderHeader,
		invalidate() {},
	}));
}

export default function piNenLogoExtension(pi: ExtensionAPI): void {
	pi.on("session_start", async (_event, ctx) => {
		install(ctx);
	});
}
