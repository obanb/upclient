import {sync} from 'glob';
import {existsSync, readFileSync, writeFileSync} from 'fs';

// lang directory
const dirs = ['./lang'];

// our directory where langugae .json files are
const ourDir = dirs[0];

// default locale
const defaultLocale = 'cs';

// default Lang.ts file
const defaultLangTsFile = './client/Lang.ts';

const readMessages = (file: string) => JSON.parse(readFileSync(file, 'utf8'));
const writeMessages = (file: string, content: any) => writeFileSync(file, JSON.stringify(content, null, 2));

// get default messages from ./${dir}/.messages/*
const defaultMessages = dirs.reduce((array, dir) => array.concat(sync(`${dir}/.messages/**/*.json`)), [])
    .map((filename) => readMessages(filename))
    .reduce((messages, descriptors) => {
        descriptors.forEach(({id, defaultMessage}: any) => {
            if (messages.hasOwnProperty(id)) {
                throw new Error(`Duplicate message id: ${id}`);
            }
            messages[id] = defaultMessage;
        });
        return messages;
    }, {});

const defaultLangFileName = `${defaultLocale}.json`;
const defaultLangFile = `${ourDir}/${defaultLangFileName}`;

// save default messages to default lang file
writeMessages(defaultLangFile, defaultMessages);

// tslint:disable-next-line
console.log('\x1b[32m', `Wrote default messages to: "${defaultLangFile}"`);

// save Lang.ts
const keys = Object.keys(defaultMessages);
const langTsContent = `// This file is generated from scripts/default-lang.ts, don\'t modify, run npm run generate:lang
${keys.reduce((acc, key, index) => {
    const endLine = index + 1 === keys.length ? '' : '\n';
    acc += `    ${key
        .toUpperCase()
        .replace(',', '')
        .replace(/\./g, '_')}: '${key}',${endLine}`;
    return acc;
}, 'export const Lang = {\n')}
};\n`;
writeFileSync(defaultLangTsFile, langTsContent);

// tslint:disable-next-line
console.log('\x1b[32m', `Create or replace TypeScript file: "${defaultLangTsFile}"`);

// merge default messages with other languages files
const allLanguageFiles = dirs.reduce((array, dir) => array.concat(sync(`${dir}/*.json`)), []);

const nonDefaultLanguageFileNames: Set<string> = allLanguageFiles.reduce((set, file) => {
    const fileName = file.substring(file.lastIndexOf('/')+1, file.length);
    if (fileName !== defaultLangFileName) {
        set.add(fileName);
    }
    return set;
}, new Set());

nonDefaultLanguageFileNames
    .forEach((fileName) => {
        // Check for file in all directories
        let messages = defaultMessages;
        const filesRead = [];

        dirs.forEach((dir) => {
            const file = `${dir}/${fileName}`;
            if (existsSync(file)) {
                messages = {...messages, ...readMessages(file)}
                filesRead.push(file);
            }
        });

        writeMessages(`${ourDir}/${fileName}`, messages);

        // tslint:disable-next-line
        console.log('\x1b[32m', `Merge files: ${filesRead} with ${defaultLangFile}`);
    });

// tslint:disable-next-line
console.log('\x1b[0m');
