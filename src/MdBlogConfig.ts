


export type MdBlogConfig = {
    siteTitle: string;
    hostname: string;
    rootDir: string;
    basePath?: string;
    description?: string;
    keywords?: string[];
    httpPort?: number;
    gopherPort?: number;
    author: string;
    path?: string;
    syslogIdentifier?: string;
};

export function parseConfig(config: any): MdBlogConfig {
    if (typeof (config) == 'object') {
        if (typeof (config?.siteTitle) !== 'string') throw new Error(`Site title is missing`);
        if (config.siteTitle == '') throw new Error(`Site title can not be empty`);
        if (typeof (config?.hostname) !== 'string') throw new Error(`Site title is missing`);
        if (typeof (config?.siteTitle) !== 'string') throw new Error(`Site title is missing`);
        // TODO
    }
    return config as MdBlogConfig;
}