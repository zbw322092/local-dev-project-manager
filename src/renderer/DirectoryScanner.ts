import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as exprima from 'esprima';
import { Property } from 'estree';

export class DirectoryScanner {

  private readonly osDirPath: string = os.homedir();

  private readonly defaultWorkspace = path.resolve(this.osDirPath, './Documents/JR_Workspace');

  private getWebpackEntry(projectName: string): string[] {
    const projectPath = path.resolve(this.defaultWorkspace, projectName, 'venus.config.js');
    const fileString = fs.readFileSync(projectPath, { encoding: 'UTF-8' });
    let entryObjProps: Property[] = [];
    exprima.parseScript(fileString, {}, (node) => {
      if (node.type === 'Property' && node.key.type === 'Identifier' &&
        node.key.name === 'entry') {
          const entryObjNode = node.value;
          if (entryObjNode.type === 'ObjectExpression') {
            entryObjProps = entryObjNode.properties;
          }
      }
    });

    const entriesArr: string[] = [];
    entryObjProps.forEach((entryProp) => {
      if (entryProp.key.type === 'TemplateLiteral') {
        const quasis = entryProp.key.quasis;
        quasis.forEach((ele) => {
          if (ele.tail === true) {
            entriesArr.push(ele.value.cooked);
          }
        });
      }
    });

    return entriesArr;
  }

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

  public listVenusModules(projectName: string): string[] {
    const projectPath = path.resolve(this.defaultWorkspace, projectName);
    if (!this.isVenusProject(projectPath)) { return []; }
    return this.getWebpackEntry(projectName);
  }
}
