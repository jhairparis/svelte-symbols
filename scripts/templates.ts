export default function fileFormat(
  formattedName: string,
  iconData: string,
  type: string,
  id?: string
) {
  switch (type) {
    case "svelte":
      return `<script>let ${formattedName};</script>\n` + `${iconData}\n`;
    case "fileExport":
      return (
        `import ${formattedName} from "./${formattedName}.svelte";\n` +
        `export {${formattedName}};\n`
      );
    case "end":
      return `export * from './${id}';\n`;
    default:
      throw new Error(`Unknown type: ${type}`);
  }
}
