# vite-plugin-opmage

A Vite plugin that optimizes images using [@napi-rs/image](https://github.com/Brooooooklyn/Image) (a high-performance image processing library written in Rust).

## Features

- Optimize images during the build process by lossless/lossy compressing them.
- Support PNG, JPEG, WebP, and AVIF formats.

## Installation

> [!NOTE]
> This plugin requires [`@napi-rs/image`](https://npmx.dev/package/@napi-rs/image) to be installed as a peer dependency.

```bash
npm install vite-plugin-opmage --save-dev
```

```ts
# vite.config.ts

import { defineConfig, type UserConfig } from 'vite-plus';
import Opmage from 'vite-plugin-opmage';

const config: UserConfig = defineConfig({
	plugins: [Opmage()],
});

export default config;
```

## License

Licensed under the [MIT](./LICENSE) license.
