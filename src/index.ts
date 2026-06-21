import type { Plugin } from 'rolldown';
import { Config, defaultOptions, type Options } from './options';
import { provide, runPromise, tap, timed } from 'effect/Effect';
import { Duration, Layer, pipe } from 'effect';
import { compressor } from './compressors';
import { convertMillisecondsToSeconds } from './utils/time';
import pc from 'picocolors';

export default function Opmage(opts: Partial<Options> = {}): Plugin {
	const options = { ...defaultOptions, ...opts } satisfies Options;

	const ConfigLive = Layer.succeed(Config, options);

	return {
		name: 'rolldown-plugin-opmage',
		async generateBundle(_, bundles) {
			const program = pipe(
				compressor(bundles, options),
				provide(ConfigLive),

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
