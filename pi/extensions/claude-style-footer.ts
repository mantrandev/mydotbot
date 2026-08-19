import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { truncateToWidth } from "@earendil-works/pi-tui";

function parsePercent(value: string | undefined): number | undefined {
	if (!value) return undefined;
	const parsed = Number.parseFloat(value.replace("%", ""));
	return Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : undefined;
}

function parseResetAt(value: string | undefined): number | undefined {
	if (!value) return undefined;
	const numeric = Number(value);
	if (Number.isFinite(numeric)) return numeric > 1_000_000_000_000 ? numeric : numeric * 1000;
	const parsed = Date.parse(value);
	return Number.isFinite(parsed) ? parsed : undefined;
}

function formatReset(resetAt: number | undefined): string {
	if (!resetAt) return "—";
	return `${Math.max(0, Math.ceil((resetAt - Date.now()) / 3_600_000))}h`;
}

export default function (pi: ExtensionAPI) {
	let weeklyRemaining: number | undefined;
	let weeklyResetAt: number | undefined;
	let requestRender: (() => void) | undefined;

	pi.on("after_provider_response", (event) => {
		const headers = Object.fromEntries(Object.entries(event.headers).map(([key, value]) => [key.toLowerCase(), value]));
		const remaining = parsePercent(
			headers["x-codex-secondary-remaining-percent"] ?? headers["x-ratelimit-weekly-remaining-percent"],
		);
		const used = parsePercent(
			headers["x-codex-secondary-used-percent"] ?? headers["x-ratelimit-weekly-used-percent"],
		);
		weeklyRemaining = remaining ?? (used === undefined ? weeklyRemaining : 100 - used);

		const resetAfter = Number(
			headers["x-codex-secondary-reset-after-seconds"] ??
				headers["x-ratelimit-weekly-reset-after-seconds"] ??
				Number.NaN,
		);
		weeklyResetAt = Number.isFinite(resetAfter)
			? Date.now() + resetAfter * 1000
			: (parseResetAt(headers["x-codex-secondary-reset-at"] ?? headers["x-ratelimit-weekly-reset-at"]) ??
				weeklyResetAt);
		requestRender?.();
	});

	pi.on("session_start", (_event, ctx) => {
		if (ctx.mode !== "tui") return;

		ctx.ui.setTheme("claude-code-dark");
		ctx.ui.setFooter((tui, theme, footerData) => {
			requestRender = () => tui.requestRender();
			const unsubscribe = footerData.onBranchChange(requestRender);

			return {
				dispose() {
					unsubscribe();
					requestRender = undefined;
				},
				invalidate() {},
				render(width: number): string[] {
					const model = ctx.model?.id ?? "no-model";
					const branch = footerData.getGitBranch();
					const effort = ctx.model?.reasoning ? ctx.thinkingLevel : "off";
					const separator = theme.fg("dim", "  |  ");
					let first = `${theme.fg("warning", `[${model}]`)}  ${theme.fg("thinkingMedium", effort)}`;
					if (branch) first += `${separator}${theme.fg("success", branch)}`;

					const contextPercent = ctx.getContextUsage()?.percent;
					const contextValue = contextPercent ?? 0;
					const contextText = contextPercent === null || contextPercent === undefined ? "Context —" : `Context ${Math.round(contextPercent)}%`;
					const contextColor = contextValue >= 85 ? "error" : contextValue >= 70 ? "warning" : "muted";
					const weeklyText = weeklyRemaining === undefined ? "Weekly —" : `Weekly ${Math.round(weeklyRemaining)}% remain`;
					const weeklyColor = weeklyRemaining === undefined ? "dim" : weeklyRemaining <= 15 ? "error" : weeklyRemaining <= 30 ? "warning" : "success";
					const second =
						theme.fg(contextColor, contextText) +
						separator +
						theme.fg(weeklyColor, weeklyText) +
						separator +
						theme.fg("warning", `↻ ${formatReset(weeklyResetAt)}`);

					return [truncateToWidth(first, width, ""), "", truncateToWidth(second, width, "")];
				},
			};
		});
	});
}
