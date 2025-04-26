import { MdBlogConfig } from "./MdBlogConfig";

export const APP_NAME = "mdblog";
export const DEFAULT_CONF_PATH = `~/.${APP_NAME}/default.json`;
export const CONFIG_FILE_NAME = ".mdblog.config.json";
export const DIR_STATIC_NAME = ".static";
export const DIR_TEMPLATES_NAME = ".templates";

export const CONFIG_DEFAULT: MdBlogConfig = {
    siteTitle: "My MdBlog",
    hostname: "localhost",
    rootDir: ".",
    httpPort: 8080,
    gopherPort: 8070,
    author: "John Doe",
    syslogIdentifier: "mdblog",
    fediverseCreator: null
} as const;