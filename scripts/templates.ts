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
          export let color='currentColor';
		  let className;
		  export { className as class};
        </script>\n` + `${iconData}\n`
			);
		case 'svelteDTS':
			return `
/** @typedef {typeof __propDef.props}  ${formattedName}Props */
/** @typedef {typeof __propDef.events} ${formattedName}Events */
/** @typedef {typeof __propDef.slots}  ${formattedName}Slots */
export default class ${formattedName} extends SvelteComponentTyped<{
    [x: string]: any;
    color?: string;
    size?: number;
    class?: string;
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
		class?: string;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
`;
		default:
			throw new Error(`Unknown type: ${type}`);
	}
}
