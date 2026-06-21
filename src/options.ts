import type {
	AvifConfig,
	JpegCompressOptions,
	PNGLosslessOptions,
	PngQuantOptions,
} from '@napi-rs/image';
import { Context } from 'effect';

export type LosslessPngOptions = { algorithm: 'lossless' } & PNGLosslessOptions;
export type LossyPngOptions = { algorithm: 'lossy' } & PngQuantOptions;
export type PngOptions = LosslessPngOptions | LossyPngOptions;

export type JpegOptions = JpegCompressOptions;

export type LossyWebpOptions = { algorithm: 'lossy'; quality: number };
export type LosslessWebpOptions = { algorithm: 'lossless' };
export type WebpOptions = LosslessWebpOptions | LossyWebpOptions;

export type AvifOptions = AvifConfig;

export type Options = {
	concurrency: number;
	png: PngOptions;
	jpeg: JpegOptions;
	webp: WebpOptions;
	avif: AvifOptions;
};

export const defaultOptions: Options = {
	concurrency: 5,
	png: {
		algorithm: 'lossless',
		strip: true,
	},
	jpeg: {
		quality: 80,
	},
	webp: {
		algorithm: 'lossy',
		quality: 80,
	},
	avif: {
		quality: 75,
	},
};

export class Config extends Context.Tag('rolldown-plugin-opmage/Config')<Config, Options>() {}
