import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export class DirectoryScanner {

  private readonly osDirPath: string = os.homedir();

  private readonly defaultWorkspace = path.resolve(this.osDirPath, './Documents/JR_Workspace');

  public isVenusProject(projectRootPath: string): boolean {
    const projectFiles = fs.readdirSync(projectRootPath);
    return projectFiles.includes('venus.config.js');
  }

  public listVenusProject(): string[] {
    const files = fs.readdirSync(this.defaultWorkspace);
    if (!files.length) { return files; }

    // filter out valid venus files
    const validFiles: string[] = [];
    files.forEach((file, key) => {
      const filePath = path.resolve(this.defaultWorkspace, file);
      if (file === '.DS_Store') { return; }
      if (!fs.statSync(filePath).isDirectory()) { return; }
      if (!this.isVenusProject(filePath)) { return; }

      validFiles.push(file);
    });

    console.log(validFiles);
    return validFiles;
  }
}