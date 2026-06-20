export const convertMillisecondsToSeconds = (ms: number, fixed: number = 2): string =>
	(ms / 1000).toFixed(fixed);
