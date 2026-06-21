import type { JpegOptions } from '@/options';
import { compressJpeg } from '@napi-rs/image';
import { tryPromise } from 'effect/Effect';

export const jpegCompressor = (buffer: Uint8Array, options: JpegOptions) =>
	tryPromise(() => compressJpeg(buffer, options));
