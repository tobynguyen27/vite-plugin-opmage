import { defineConfig } from 'vite-plus';
import { recommended as oxlintCasePolice } from 'oxlint-plugin-case-police';

export default defineConfig({
	resolve: {
		tsconfigPaths: true,
	},
	staged: {
		'*': 'vp check --fix',
	},
	pack: {
		dts: true,
		clean: true,
		format: ['esm'],
		exports: true,
	},
	lint: {
		options: {
			typeAware: true,
			typeCheck: true,
		},
		extends: [oxlintCasePolice],
	},
	fmt: {
		useTabs: true,
		tabWidth: 4,
		printWidth: 100,
		endOfLine: 'lf',
		bracketSameLine: true,
		singleQuote: true,
		ignorePatterns: ['dist/**', 'node_modules/**'],
		overrides: [
			{
				files: ['*.yml', '*.yaml', '*.md'],
				options: {
					tabWidth: 2,
					useTabs: false,
				},
			},
		],
	},
});
