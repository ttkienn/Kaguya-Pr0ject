import { EventEmitter } from 'events';
import axios from 'axios';
import archiver from 'archiver';
import { promises as fsAsync, existsSync, statSync, createWriteStream, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class KaguyaUpdater extends EventEmitter {
  constructor() {
    super();
    this.repositoryBaseURL = "https://raw.githubusercontent.com/ttkienn/Kaguya-Pr0ject/master";
    this.updateManifestURL = 'https://ditmemaykkkk.com/cache/update.json';
  }

  async fetchUpdateManifest() {
    const response = await axios.get(this.updateManifestURL);
    if (!Array.isArray(response.data) || response.data.length !== 3) {
      throw new Error("Invalid update manifest format");
    }
    return { filesToAdd: [...response.data[0], "./package.json"], filesToRemove: response.data[1] };
  }

  async executeUpdate(updateManifest) {
    this.emit('update-started', updateManifest);
    await Promise.all(updateManifest.filesToRemove.map(this.removeFile.bind(this)));
    await Promise.all([...updateManifest.filesToAdd].map(this.downloadFile.bind(this)));
    this.emit('update-completed');
  }

  async checkFileAvailability(filePath) {
    const url = `${this.repositoryBaseURL}/${filePath}`;
    try {
      const response = await axios.head(url);
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async downloadFile(filePath) {
    const url = `${this.repositoryBaseURL}/${filePath}`;
    const response = await axios.get(url, { responseType: 'stream' });
    const fullFilePath = join(__dirname, filePath);

    await fsAsync.mkdir(dirname(fullFilePath), { recursive: true });
    const fileWriter = response.data.pipe(createWriteStream(fullFilePath));

    await new Promise((resolve, reject) => {
      fileWriter.on('finish', () => resolve());
      fileWriter.on('error', reject);
    });
    this.emit('file-downloaded', filePath);
  }

  async removeFile(filePath) {
    const fullFilePath = join(__dirname, filePath);
    if (existsSync(fullFilePath)) {
      const fileStats = statSync(fullFilePath);
      if (fileStats.isDirectory()) {
        await fsAsync.rm(fullFilePath, { recursive: true, force: true });
      } else {
        await fsAsync.unlink(fullFilePath);
      }
      this.emit("file-remove", filePath);
    }
  }
  async backupFiles(backupPath) {
    const output = createWriteStream(backupPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => console.log(`Backup completed, total bytes: ${archive.pointer()}`));
    archive.on('warning', err => console.error(err));
    archive.on('error', err => console.error(err));

    archive.pipe(output);

    const items = readdirSync(__dirname);
    for (const item of items) {
      if (item !== 'node_modules') {
        const fullPath = join(__dirname, item);
        const stats = statSync(fullPath);
        if (stats.isDirectory()) {
          archive.directory(fullPath, item);
        } else {
          archive.file(fullPath, { name: item });
        }
      }
    }

    await archive.finalize();
  }
}

async function runUpdater() {
  const updater = new KaguyaUpdater();
  updater.on('file-downloaded', filePath => console.log(chalk.green(`Downloaded: ${filePath}`)));
  updater.on('update-started', () => console.log(chalk.yellow('Update started')));
  updater.on('update-completed', () => {
    console.log(chalk.yellow("Update completed, now reinstall dependencies with 'npm install' and then run the bot with 'npm start'"))
  });
  try {
    const date = new Date();
    const dateString = date.toISOString().split('T')[0];
    const backupPath = join(__dirname, `backup_${dateString}.zip`);
    console.log(chalk.blue(`Backing up files to ${backupPath}`));
    await updater.backupFiles(backupPath);
    console.log(chalk.green('Backup successful, proceed with update'));
    const updateManifest = await updater.fetchUpdateManifest();
    updateManifest.filesToAdd = await filterAvailableFiles(updateManifest.filesToAdd, updater);
    await updater.executeUpdate(updateManifest);
  } catch (error) {
    console.error('Updater process encountered an error:', error);
  }
}

async function filterAvailableFiles(files, updater) {
  const checks = files.map(filePath => updater.checkFileAvailability(filePath));
  const results = await Promise.all(checks);
  return files.filter((_, index) => results[index]);
}

runUpdater();
