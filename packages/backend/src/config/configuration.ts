/* eslint-disable @typescript-eslint/no-explicit-any */
import { readFileSync, existsSync } from "fs";
import * as yaml from "js-yaml";
import { join } from "path";

const YAML_CONFIG_FILENAME = join(
  "config",
  (process.env.ENV || "local") + ".yaml"
);

export default (): Record<string, any> => {
  if (existsSync(YAML_CONFIG_FILENAME)) {
    const yamlFileContents = readFileSync(YAML_CONFIG_FILENAME, "utf8");
    return yaml.load(yamlFileContents) as Record<string,any>;
  }
  const jsonContents = process.env.CONFIGURATION_JSON ?? '{}';
  return JSON.parse(jsonContents);
};
