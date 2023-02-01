import path from 'path';
import { promises as fs } from 'fs';
import camelcase from 'camelcase';
import fileFormat from './templates';
import { getIconFiles } from './logics';
import svgo from './svgo';
import { IconDefinition } from './_types';
import { icons } from '../src/icons';

export async function dirInit(home: string) {
	const ignore = (err) => {
		if (err.code === 'EEXIST') return;
		throw err;
	};
	await fs.mkdir(home, { recursive: true }).catch(ignore);

	const write = (filePath, str) =>
		fs.writeFile(path.resolve(home, ...filePath), str, 'utf8').catch(ignore);

	const initFiles = ['index.js', 'index.d.ts'];

	for (const icon of icons) {
		await fs.mkdir(path.resolve(home, icon.id)).catch(ignore);

		await write([icon.id, 'index.js'], '// THIS FILE IS AUTO GENERATED\n');
	}

	for (const file of initFiles) {
		if (file === 'index.d.ts') {
			await write([file], '// THIS FILE IS AUTO GENERATED One\n');
			continue;
		}
		await write([file], '// THIS FILE IS AUTO GENERATED\n');
	}

	await fs.copyFile(path.resolve(home, '../README.md'), path.resolve(home, 'README.md'));

	await fs.copyFile(path.resolve(home, '../LICENSE'), path.resolve(home, 'LICENSE'));
}

export async function writeIconModuleFiles(icon: IconDefinition, home: string) {
	const exists = new Set(); // for remove duplicate

	await fs.appendFile(
		path.resolve(home, icon.id, `index.d.ts`),
		"// THIS FILE IS AUTO GENERATED\nimport { SvelteComponentTyped } from 'svelte/internal';\n",
		'utf8'
	);
	for (const content of icon.contents) {
		const files = await getIconFiles(content);

		for (const file of files) {
			const svgStrRaw = await fs.readFile(file, 'utf8');

			const svgClean = svgo(svgStrRaw);

			const rawName = path.basename(file, path.extname(file));
			const pascalName = camelcase(rawName, { pascalCase: true });
			const name = (content.formatter && content.formatter(pascalName, file)) || pascalName;

			if (exists.has(name)) continue;
			exists.add(name);

			const fileSvelte = fileFormat(name, svgClean, 'svelte');
			await fs.writeFile(path.resolve(home, icon.id, `${name}.svelte`), fileSvelte, 'utf8');

			const fileExp = fileFormat(name, svgClean, 'fileExport');
			await fs.appendFile(path.resolve(home, icon.id, `index.js`), fileExp, 'utf8');

			const dts = fileFormat(name, svgClean, 'dts');
			await fs.writeFile(path.resolve(home, icon.id, `${name}.svelte.d.ts`), dts, 'utf8');

			const dtsIndx = fileFormat(name, svgClean, 'fileExportTS');
			await fs.appendFile(path.resolve(home, icon.id, `index.d.ts`), dtsIndx, 'utf8');

			exists.add(file);
		}
	}
	const endRes = fileFormat('', '', 'end', icon.id);
	await fs.appendFile(path.resolve(home, icon.id, `../index.js`), endRes, 'utf8');
	await fs.appendFile(path.resolve(home, icon.id, `../index.d.ts`), endRes, 'utf8');
}
