import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs-extra';
import toml from 'toml';
import config from '../setup/config.js';

const __filename = fileURLToPath(import.meta.url);

function loadLanguageFile(languageCode) {
  const langFilePath = `./languages/${languageCode || 'vi'}.toml`;
  try {
    const langFile = fs.readFileSync(langFilePath, { encoding: 'utf-8' });
    return {
      [languageCode]: toml.parse(langFile),
    };
  } catch (error) {
    throw error;
  }
}

global.language = loadLanguageFile(config.language);

const getLang = function (key, ...args) {
  const keys = key.split('.');
  let languageSection = global.language[config.language];

  for (const k of keys) {
    if (!languageSection || !languageSection[k]) {
      throw `${path.basename(__filename)} - Not found key language: [${keys.join('.')}]`;
    }
    languageSection = languageSection[k];
  }

  return args.reduce((text, arg, index) => {
    const placeholder = new RegExp(`\\$${index + 1}`, 'g');
    return text.replace(placeholder, arg);
  }, languageSection);
};

export { getLang };
