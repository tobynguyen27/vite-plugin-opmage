import type { AvifOptions } from '@/options';
import { Transformer } from '@napi-rs/image';
import { tryPromise } from 'effect/Effect';

export const avifCompressor = (buffer: Uint8Array, options: AvifOptions) =>
	tryPromise(() => new Transformer(buffer).avif(options));
