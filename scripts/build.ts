import path from 'path';
import { performance } from 'perf_hooks';
import { icons } from '../src/icons';
import * as Task from './tasks';

const _rootDir = path.resolve(__dirname, '../');

async function task(name, fn) {
	const start = performance.now();
	console.log(`================= ${name} =================`);
	await fn();
	const end = performance.now();
	console.log(`${name}: `, Math.floor(end - start) / 1000, 'sec\n\n');
}

async function main() {
	try {
		const HOME = path.resolve(_rootDir, 'dist');

		await task('@svelte-icons/intilized', async () => {
			await Task.dirInit(HOME);
		});
		type AllName = {
			id: string;
			name: string;
			content: string[];
		};
		let AllNames: AllName[] = [];

		await task('@svelte-icons/create ICONS', async () => {
			for (const icon of icons) {
				const val = await Task.writeIconModuleFiles(icon, HOME);
				AllNames = [...AllNames, { id: icon.id, name: icon.name, content: val }];
			}
		});

		await task('@svelte-icons/info of icons', async () => {
			await Task.writeIconsManifest(HOME, AllNames);
		});

		console.log('done');
	} catch (e) {
		console.error(e);
		process.exit(1);
	}
}
main();

export {};
