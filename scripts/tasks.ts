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

	for (const icon of icons) {
		await fs.mkdir(path.resolve(home, icon.id)).catch(ignore);
	}

	await fs.mkdir(path.resolve(home, 'lib')).catch(ignore);
	await fs.copyFile(path.resolve(home, '../README.md'), path.resolve(home, 'README.md'));
	await fs.copyFile(path.resolve(home, '../package.json'), path.resolve(home, 'package.json'));
	await fs.copyFile(path.resolve(home, '../LICENSE'), path.resolve(home, 'LICENSE'));
}

export async function writeIconModuleFiles(icon: IconDefinition, home: string): Promise<string[]> {
	const exists = new Set(); // for remove duplicate
	const NameIcons: string[] = [];

	for (const content of icon.contents) {
		const files = await getIconFiles(content);

		for (const file of files) {
			const svgStrRaw = await fs.readFile(file, 'utf8');

			const svgClean = svgo(svgStrRaw, icon.id === 'tb');

			const rawName = path.basename(file, path.extname(file));
			const pascalName = camelcase(rawName, { pascalCase: true });
			const name = (content.formatter && content.formatter(pascalName, file)) || pascalName;

			if (exists.has(name)) continue;
			exists.add(name);
			NameIcons.push(name);

			const fileSvelte = fileFormat(name, svgClean, 'svelte', icon.id);
			await fs.writeFile(path.resolve(home, icon.id, `${name}.svelte`), fileSvelte, 'utf8');

			const svelteDTS = fileFormat(name, svgClean, 'svelteDTS');
			await fs.writeFile(path.resolve(home, icon.id, `${name}.svelte.d.ts`), svelteDTS, 'utf8');

			exists.add(file);
		}
	}
	return NameIcons;
}

export async function writeIconsManifest(home: string, namesIcons: any[]) {
	const writeObj = icons.map((icon) => ({
		id: icon.id,
		name: icon.name,
		projectUrl: icon.projectUrl,
		license: icon.license,
		licenseUrl: icon.licenseUrl
	}));
	const manifest = JSON.stringify(writeObj, null, 2);

	const dts =
		'interface IconManifest {\n  id: string;\n  name: string;\n  projectUrl: string; license: string;\n  licenseUrl: string;\n}\n' +
		'type icons = {	id: string; name:string; content: string[];};' +
		'declare const IconsManifest:IconManifest[];\n' +
		'export default IconsManifest;' +
		'export declare const namesAllIcons: icons[];';

	await fs.writeFile(
		path.resolve(home, 'lib', 'iconsManifest.js'),
		`const IconsManifest = ${manifest}\n` +
			`export default IconsManifest;` +
			` export const namesAllIcons = ${JSON.stringify(namesIcons)};`,
		'utf8'
	);
	await fs.writeFile(path.resolve(home, 'lib', 'iconsManifest.d.ts'), dts, 'utf8');
}
