import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { truncateToWidth } from "@earendil-works/pi-tui";

export default function (pi: ExtensionAPI) {
	pi.on("session_start", (_event, ctx) => {
		if (ctx.mode !== "tui") return;

		ctx.ui.setTheme("claude-code-dark");
		ctx.ui.setFooter((tui, theme, footerData) => {
			const unsubscribe = footerData.onBranchChange(() => tui.requestRender());

			return {
				dispose: unsubscribe,
				invalidate() {},
				render(width: number): string[] {
					const model = ctx.model?.id ?? "no-model";
					const effort = ctx.model?.reasoning ? ctx.thinkingLevel : "off";
					const branch = footerData.getGitBranch() ?? "detached";
					const separator = theme.fg("dim", "  |  ");
					const contextPercent = ctx.getContextUsage()?.percent;
					const contextValue = Math.min(100, Math.max(0, contextPercent ?? 0));
					const contextLabel = contextPercent === null || contextPercent === undefined ? "—" : `${Math.round(contextValue)}%`;
					const contextColor = contextValue >= 85 ? "error" : contextValue >= 70 ? "warning" : "text";
					const barWidth = width >= 90 ? 20 : width >= 65 ? 14 : 10;
					const filled = Math.round((contextValue / 100) * barWidth);
					const labelStart = Math.floor((barWidth - contextLabel.length) / 2);
					let bar = "";

					for (let index = 0; index < barWidth; index++) {
						const labelIndex = index - labelStart;
						if (labelIndex >= 0 && labelIndex < contextLabel.length) {
							bar += theme.fg(contextColor, contextLabel[labelIndex] ?? "");
						} else if (index < filled) {
							bar += theme.fg("success", "█");
						} else {
							bar += theme.fg("border", "░");
						}
					}

					const line =
						`${theme.fg("accent", `[${model}]`)} ${theme.fg("thinkingMedium", effort)}` +
						separator +
						`${theme.fg("dim", "ctx ")}${bar}` +
						separator +
						`${theme.fg("success", "🌿")} ${theme.fg("success", branch)}`;

					return [truncateToWidth(line, width, "")];
				},
			};
		});
	});
}
