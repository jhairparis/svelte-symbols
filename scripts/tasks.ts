import path from "path";
import { promises as fs } from "fs";
import camelcase from "camelcase";
import fileFormat from "./templates";
import { getIconFiles } from "./logics";
import { svgo } from "./svgo";
import { IconDefinition } from "./_types";
import { icons } from "../src/icons";

export async function dirInit(home: string) {
  const ignore = (err) => {
    if (err.code === "EEXIST") return;
    throw err;
  };
  await fs.mkdir(home, { recursive: true }).catch(ignore);

  const write = (filePath, str) =>
    fs.writeFile(path.resolve(home, ...filePath), str, "utf8").catch(ignore);

  const initFiles = ["index.js"];

  for (const icon of icons) {
    await fs.mkdir(path.resolve(home, icon.id)).catch(ignore);

    await write([icon.id, "index.js"], "// THIS FILE IS AUTO GENERATED\n");
  }

  for (const file of initFiles) {
    await write([file], "// THIS FILE IS AUTO GENERATED\n");
  }
}

export async function writeIconModuleFiles(icon: IconDefinition, home: string) {
  const exists = new Set(); // for remove duplicate

  for (const content of icon.contents) {
    const files = await getIconFiles(content);

    for (const file of files) {
      const svgStrRaw = await fs.readFile(file, "utf8");

      const svgStr = content.processWithSVGO
        ? await svgo.optimize(svgStrRaw).then((result) => result.data)
        : svgStrRaw;

      const regex = /<svg(.|\n)*<\/svg>/;
      let validation = regex.exec(svgStr);

      const svgStrClean = validation ? validation[0] : svgStr;

      const rawName = path.basename(file, path.extname(file));
      const pascalName = camelcase(rawName, { pascalCase: true });
      const name =
        (content.formatter && content.formatter(pascalName, file)) ||
        pascalName;
      if (exists.has(name)) continue;
      exists.add(name);

      const comRes = fileFormat(name, svgStrClean, "svelte");
      await fs.writeFile(
        path.resolve(home, icon.id, `${name}.svelte`),
        comRes,
        "utf8"
      );

      const dtsRes = fileFormat(name, svgStrClean, "fileExport");
      await fs.appendFile(
        path.resolve(home, icon.id, `index.js`),
        dtsRes,
        "utf8"
      );

      exists.add(file);
    }
    const endRes = fileFormat("", "", "end", icon.id);
    await fs.appendFile(
      path.resolve(home, icon.id, `../index.js`),
      endRes,
      "utf8"
    );
  }
}
