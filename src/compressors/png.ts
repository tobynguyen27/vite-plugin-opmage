import type { LosslessPngOptions, LossyPngOptions, PngOptions } from '@/options';
import { losslessCompressPng, pngQuantize } from '@napi-rs/image';
import { tryPromise } from 'effect/Effect';

export const pngCompressor = (buffer: Uint8Array, options: PngOptions) => {
	if (options.algorithm === 'lossless') return losslessPngCompressor(buffer, options);

	return lossyPngCompressor(buffer, options);
};

const losslessPngCompressor = (buffer: Uint8Array, options: LosslessPngOptions) =>
	tryPromise(() => losslessCompressPng(buffer, options));

const lossyPngCompressor = (buffer: Uint8Array, options: LossyPngOptions) =>
	tryPromise(() => pngQuantize(buffer, options));
