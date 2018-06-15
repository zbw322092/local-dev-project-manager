import * as fs from 'fs';
import * as path from 'path';
import * as exprima from 'esprima';
import { Property } from 'estree';
import { defaultWorkspace } from '../common/paths';

export class DirectoryScanner {

  private getWebpackEntry(projectName: string): Array<{ entryKey: string, entryValue: string; }> {
    const projectPath = path.resolve(defaultWorkspace, projectName, 'venus.config.js');
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

    const entriesArr: Array<{ entryKey: string, entryValue: string; }> = [];
    entryObjProps.forEach((entryProp) => {
      const elementObj: any = {};
      if (entryProp.key.type === 'TemplateLiteral') {
        const quasis = entryProp.key.quasis;
        quasis.forEach((ele) => {
          if (ele.tail === true) {
            elementObj.entryKey = ele.value.cooked;
          }
        });
      }
      if (entryProp.value.type === 'ArrayExpression') {
        const elements = entryProp.value.elements[0] || {};
        if (elements.type === 'Literal') {
          elementObj.entryValue = elements.value;
        }
      }
      entriesArr.push(elementObj);
    });

    return entriesArr;
  }

  public isVenusProject(projectRootPath: string): boolean {
    const projectFiles = fs.readdirSync(projectRootPath);
    return projectFiles.includes('venus.config.js');
  }

  public listVenusProject(): string[] {
    const files = fs.readdirSync(defaultWorkspace);
    if (!files.length) { return files; }

    // filter out valid venus files
    const validFiles: string[] = [];
    files.forEach((file, key) => {
      const filePath = path.resolve(defaultWorkspace, file);
      if (file === '.DS_Store') { return; }
      if (!fs.statSync(filePath).isDirectory()) { return; }
      if (!this.isVenusProject(filePath)) { return; }

      validFiles.push(file);
    });

    console.log(validFiles);
    return validFiles;
  }

  public listVenusModules(projectName: string): Array<{ entryKey: string, entryValue: string; }> {
    const projectPath = path.resolve(defaultWorkspace, projectName);
    if (!this.isVenusProject(projectPath)) { return []; }
    return this.getWebpackEntry(projectName);
  }
}
