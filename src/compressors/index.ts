import { getFileExtension } from '@/utils/file';
import { forEach, gen, timed } from 'effect/Effect';
import type { OutputAsset, OutputBundle } from 'rolldown';
import { pngCompressor } from './png';
import { jpegCompressor } from './jpeg';
import { webpCompressor } from './webp';
import { avifCompressor } from './avif';
import { Config } from '@/options';
import { Logger } from '@/logger';
import { Duration, pipe, Ref } from 'effect';
import prettyBytes from 'pretty-bytes';
import { hash } from 'ohash';
import { CacheStorage } from '@/services/cache';

export const compressor = (bundles: OutputBundle) =>
	gen(function* () {
		const bundlesNeedCompress = Object.values(bundles).filter(
			(bundle): bundle is OutputAsset & { source: Uint8Array } =>
				bundle.type === 'asset' && typeof bundle.source !== 'string',
		);

		const { concurrency, ...config } = yield* Config;
		const cacheStorage = yield* CacheStorage;

		const counter = yield* Ref.make(1);

		yield* forEach(
			bundlesNeedCompress,
			(bundle) =>
				gen(function* () {
					const logger = yield* Logger;

					const fileExtension = getFileExtension(bundle.fileName);
					const buffer = bundle.source;

					const bufferStr = Buffer.from(buffer).toString('base64');

					const cachedKey = pipe(
						config[fileExtension as keyof typeof config],
						JSON.stringify,
						(str) => str + bufferStr,
						hash,
					);

					const cacheHit = yield* cacheStorage.has(cachedKey);
					const cacheValue = yield* cacheStorage.get(cachedKey);

					if (cacheHit && cacheValue) {
						const b = Buffer.from(cacheValue, 'base64');

						bundle.source = b;

						const index = yield* Ref.getAndUpdate(counter, (n) => n + 1);

						logger.info(
							`${bundle.fileName} (reused cache entry) (+0ms) (${index}/${Object.values(bundles).length - 1})`,
						);
					} else {
						yield* cacheStorage.set(cachedKey, bufferStr);

						const oldSizeInBytes = prettyBytes(buffer.byteLength);
						const [duration, newBuffer] = yield* pipe(
							gen(function* () {
								switch (fileExtension) {
									case 'png':
										return yield* pngCompressor(buffer);
									case 'jpg':
									case 'jpeg':
										return yield* jpegCompressor(buffer);
									case 'webp':
										return yield* webpCompressor(buffer);
									case 'avif':
										return yield* avifCompressor(buffer);
									default:
										return buffer;
								}
							}),
							timed,
						);
						const resolveTimeMs = pipe(Duration.toMillis(duration), Math.round);

						bundle.source = newBuffer;

						const index = yield* Ref.getAndUpdate(counter, (n) => n + 1);

						logger.info(
							`${bundle.fileName} (before: ${oldSizeInBytes}) (after: ${prettyBytes(newBuffer.byteLength)}) (${resolveTimeMs}ms) (${index}/${Object.values(bundles).length - 1})`,
						);
					}
				}),
			{ concurrency },
		);
	});
