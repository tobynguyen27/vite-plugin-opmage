import type { Plugin } from 'rolldown';
import { defaultOptions, type Options } from './options';
import { runPromise, tap, timed } from 'effect/Effect';
import { Duration, pipe } from 'effect';
import { compressor } from './compressors';
import { convertMillisecondsToSeconds } from './utils/time';
import pc from 'picocolors';

export default function Opmage(opts: Partial<Options> = {}): Plugin {
	const options = { ...defaultOptions, ...opts } satisfies Options;

	return {
		name: 'rolldown-plugin-opmage',
		async generateBundle(outputOptions, bundles, isWrite) {
			const program = pipe(
				compressor(bundles, options),
				timed,
				tap(([duration]) => {
					pipe(
						`Completed in ${pipe(duration, Duration.toMillis, convertMillisecondsToSeconds)}s.`,
						pc.green,
						this.info,
					);
				}),
			);

			this.info(pipe(' generating optimized images ', pc.bgGreen, pc.black));
			await runPromise(program);
		},
	};
}
