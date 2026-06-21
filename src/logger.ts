import { Context } from 'effect';

export class Logger extends Context.Tag('rolldown-plugin-opmage/Logger')<
	Logger,
	{
		info: (msg: string) => void;
		warn: (msg: string) => void;
		error: (msg: string) => void;
	}
>() {}
