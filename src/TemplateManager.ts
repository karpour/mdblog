import ejs, { TemplateFunction } from "ejs";
import fs, { readFileSync } from "fs";
import path from "path";
import { verbose } from "./log";

const requiredTemplates = [
    "home",
    "single",
    "archive",
    "notfound"
] as const;

export type RequiredTemplate = typeof requiredTemplates[number];


export type TemplateSet = {
    [key in RequiredTemplate]: TemplateFunction;
};

export type TemplateSets = Record<string, TemplateSet>;

function getFileContents(filePath: string) {
    return readFileSync(filePath).toString();
}

/* Discovers all template types in a directory */
export function getTemplates(directory: string): TemplateSets {
    const templateDirs = fs.readdirSync(directory, { withFileTypes: true });
    const templateSets: TemplateSets = {};

    const missingTemplates: string[] = [];

    for (const templateDir of templateDirs) {
        const templateName = templateDir.name;
        const fullPath = path.join(directory, templateName);
        if (templateDir.isDirectory()) {
            verbose(`Checking for templates in "${fullPath}"`);
            const templateSet: Partial<TemplateSet> = {};
            for (let t of requiredTemplates) {
                const templateFilePath = path.join(fullPath, `${t}.ejs`);
                if (!fs.existsSync(templateFilePath)) {
                    missingTemplates.push(templateFilePath);
                    continue;
                }
                verbose(`Compiling template: ${templateFilePath}`);
                templateSet[t] = ejs.compile(getFileContents(templateFilePath));
            }
            templateSets[templateName] = templateSet as TemplateSet;
            const files = fs.readdirSync(directory).filter((f: string) => f.endsWith(".ejs"));
        }
    }

    if (missingTemplates.length) {
        throw new Error(`Missing the following templates:\n${missingTemplates.join('\n')}`);
    }

    return templateSets;
}