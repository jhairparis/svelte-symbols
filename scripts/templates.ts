export default function fileFormat(
	formattedName: string,
	iconData: string,
	type: string,
	id?: string
) {
	switch (type) {
		case 'svelte':
			return (
				`<script>// THIS FILE IS AUTO GENERATED\n
          export let size= 24;
          export let color;
        </script>\n` + `${iconData}\n`
			);
		case 'fileExport':
			return (
				`import ${formattedName} from "./${formattedName}.svelte";\n` +
				`export {${formattedName}};\n`
			);
		case 'fileExportTS':
			return `export declare const ${formattedName}: SvelteComponentTyped;\n`;
		case 'dts':
			return `
/** @typedef {typeof __propDef.props}  ${formattedName}Props */
/** @typedef {typeof __propDef.events} ${formattedName}Events */
/** @typedef {typeof __propDef.slots}  ${formattedName}Slots */
export default class ${formattedName} extends SvelteComponentTyped<{
    [x: string]: any;
    color?: string;
    size?: number;
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type ${formattedName}Props = typeof __propDef.props;
export type ${formattedName}Events = typeof __propDef.events;
export type ${formattedName}Slots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
        color?: string;
        size?: number;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
`;
		case 'end':
			return `export * from './${id}';\n`;
		default:
			throw new Error(`Unknown type: ${type}`);
	}
}
