import type { LossyWebpOptions, WebpOptions } from '@/options';
import { Transformer } from '@napi-rs/image';
import { tryPromise } from 'effect/Effect';

export const webpCompressor = (buffer: Uint8Array, options: WebpOptions) => {
	if (options.algorithm === 'lossless') return losslessWebpCompressor(buffer);

	return lossyWebpCompressor(buffer, options);
};

const losslessWebpCompressor = (buffer: Uint8Array) =>
	tryPromise(() => new Transformer(buffer).webpLossless());

const lossyWebpCompressor = (buffer: Uint8Array, { quality }: LossyWebpOptions) =>
	tryPromise(() => new Transformer(buffer).webp(quality));
