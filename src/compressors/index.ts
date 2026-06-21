import { getFileExtension } from '@/utils/file';
import { forEach, gen } from 'effect/Effect';
import type { OutputAsset, OutputBundle } from 'rolldown';
import { pngCompressor } from './png';
import { jpegCompressor } from './jpeg';
import { webpCompressor } from './webp';
import { avifCompressor } from './avif';
import type { Options } from '@/options';

export const compressor = (bundles: OutputBundle, options: Options) =>
	forEach(
		Object.values(bundles).filter(
			(bundle): bundle is OutputAsset & { source: Uint8Array } =>
				bundle.type === 'asset' && typeof bundle.source !== 'string',
		),
		(bundle) =>
			gen(function* () {
				const fileExtension = getFileExtension(bundle.fileName);
				const buffer = bundle.source;

				switch (fileExtension) {
					case 'png':
						bundle.source = yield* pngCompressor(buffer, options.png);
						break;
					case 'jpg':
					case 'jpeg':
						bundle.source = yield* jpegCompressor(buffer, options.jpeg);
						break;
					case 'webp':
						bundle.source = yield* webpCompressor(buffer, options.webp);
						break;
					case 'avif':
						bundle.source = yield* avifCompressor(buffer, options.avif);
						break;
				}
			}),
		{ concurrency: options.concurrency },
	);
