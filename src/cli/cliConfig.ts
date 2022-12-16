import { existsSync, readFileSync } from "fs";
import path from "path";
import { CONFIG_FILE_NAME } from "../defaults";
import log, { verbose } from "../log";
import { MdBlogConfig, parseConfig } from "../MdBlogConfig";
import isDirectory from "./isDirectory";


var cPath: string;

export function setConfigPath(configPath: string) {
    cPath = configPath;
}

/**
 * Get config that was supplied via cli path
 * @return config object
 * @throws error if config could not be loaded
 */
export function getConfig(configPath: string): MdBlogConfig {
    if (!existsSync(configPath)) {
        throw new Error(`Config not found at "${configPath}"`);
    }
    if (isDirectory(configPath)) {
        configPath = path.join(configPath, CONFIG_FILE_NAME);
        verbose(`Looking for config file at "${configPath}"`);
    }
    return parseConfig(JSON.parse(readFileSync(configPath).toString()));
}