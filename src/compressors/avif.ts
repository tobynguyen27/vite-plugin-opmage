import { Config } from '@/options';
import { Transformer } from '@napi-rs/image';
import { gen, tryPromise } from 'effect/Effect';

export const avifCompressor = (buffer: Uint8Array) =>
	gen(function* () {
		const { avif } = yield* Config;

		return yield* tryPromise(() => new Transformer(buffer).avif(avif));
	});
