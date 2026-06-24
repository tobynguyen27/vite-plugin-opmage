import { getFileExtension } from '@/utils/file';
import { forEach, gen, succeed, timed } from 'effect/Effect';
import type { OutputAsset, OutputBundle } from 'rolldown';
import { pngCompressor } from './png';
import { jpegCompressor } from './jpeg';
import { webpCompressor } from './webp';
import { avifCompressor } from './avif';
import { Config } from '@/options';
import { Logger } from '@/services/logger';
import { Duration, pipe, Ref } from 'effect';
import prettyBytes from 'pretty-bytes';
import { hash } from 'ohash';
import { CacheStorage } from '@/services/cache';

const compress = (ext: string, buffer: Uint8Array) => {
	switch (ext) {
		case 'png':
			return pngCompressor(buffer);
		case 'jpg':
		case 'jpeg':
			return jpegCompressor(buffer);
		case 'webp':
			return webpCompressor(buffer);
		case 'avif':
			return avifCompressor(buffer);
		default:
			return succeed(buffer);
	}
};

export const compressor = (bundles: OutputBundle) =>
	gen(function* () {
		const bundlesNeedCompress = Object.values(bundles).filter(
			(bundle): bundle is OutputAsset & { source: Uint8Array } =>
				bundle.type === 'asset' && typeof bundle.source !== 'string',
		);

		const { concurrency, ...config } = yield* Config;
		const logger = yield* Logger;
		const cacheStorage = yield* CacheStorage;

		const counter = yield* Ref.make(1);
		const total = Object.values(bundles).length - 1;

		yield* forEach(
			bundlesNeedCompress,
			(bundle) =>
				gen(function* () {
					const fileExtension = getFileExtension(bundle.fileName);
					const buffer = bundle.source;
					const stringBuffer = Buffer.from(buffer).toString('base64');

					const cacheKey = pipe(
						config[fileExtension as keyof typeof config],
						JSON.stringify,
						(str) => str + stringBuffer,
						hash,
					);

					const cached = yield* cacheStorage.get(cacheKey);
					const index = yield* Ref.getAndUpdate(counter, (n) => n + 1);

					if (cached !== null) {
						bundle.source = Buffer.from(cached, 'base64');
						logger.info(
							`${bundle.fileName} (reused cache entry) (+0ms) (${index}/${total})`,
						);
					} else {
						const [duration, newBuffer] = yield* timed(compress(fileExtension, buffer));
						const resolveTimeMs = pipe(Duration.toMillis(duration), Math.round);

						yield* cacheStorage.set(
							cacheKey,
							Buffer.from(newBuffer).toString('base64'),
						);

						bundle.source = newBuffer;
						logger.info(
							`${bundle.fileName} (before: ${prettyBytes(buffer.byteLength)}) (after: ${prettyBytes(newBuffer.byteLength)}) (${resolveTimeMs}ms) (${index}/${total})`,
						);
					}
				}),
			{ concurrency },
		);
	});
