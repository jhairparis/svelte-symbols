import { type IconDefinitionContent } from "./_types";
import { glob } from "./glob";

export async function getIconFiles(content: IconDefinitionContent) {
  if (typeof content.files === "string") {
    const pattern = content.files.replace(/\\/g, "/"); // convert windows path
    return glob(pattern);
  }
  return content.files();
}
