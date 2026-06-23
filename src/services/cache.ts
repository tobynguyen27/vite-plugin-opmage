import { Context } from 'effect';
import type { UnknownException } from 'effect/Cause';
import { sync, tryPromise, type Effect } from 'effect/Effect';
import { createStorage } from 'unstorage';
import fsDriver from 'unstorage/drivers/fs-lite';

interface CacheStorageService {
	has: (key: string) => Effect<boolean, UnknownException, never>;
	get: (key: string) => Effect<string | null, UnknownException, never>;
	set: (key: string, value: string) => Effect<void, UnknownException, never>;
}

export class CacheStorage extends Context.Tag('rolldown-plugin-opmage/CacheStorage')<
	CacheStorage,
	CacheStorageService
>() {}

export const createCacheStorage = sync(
	(cacheFolderPath: string = './node_modules/.cache/opmage') => {
		const storage = createStorage({
			driver: fsDriver({ base: cacheFolderPath }),
		});

		return {
			has: (key: string) => tryPromise(() => storage.has(key)),
			get: (key: string) => tryPromise(() => storage.get<string>(key)),
			set: (key: string, value: string) => tryPromise(() => storage.set(key, value)),
		} satisfies CacheStorageService;
	},
);
