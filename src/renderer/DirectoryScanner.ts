import * as fs from 'fs';
import * as path from 'path';
import * as exprima from 'esprima';
import { Property } from 'estree';
import { defaultWorkspace } from '../common/paths';

interface ModuleWebpackEntries {
  entryKey: string;
  prev: string;
  last: string;
  entryValue: string;
}

export interface ProjectModuleMapping {
  projectName: string;
  active: boolean;
  modules: ModuleWebpackEntries[];
}

export class DirectoryScanner {

  private getWebpackEntry(projectName: string): ModuleWebpackEntries[] {
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

    const entriesArr: ModuleWebpackEntries[] = [];
    entryObjProps.forEach((entryProp) => {
      const elementObj: any = {};
      if (entryProp.key.type === 'TemplateLiteral') {
        const quasis = entryProp.key.quasis;
        quasis.forEach((ele) => {
          if (ele.tail === true) {
            const entryKey = ele.value.cooked;
            const lastSlashIndex = entryKey.lastIndexOf('/');
            const entryKeyQuery = entryKey.indexOf('?') === -1 ? undefined : entryKey.indexOf('?');
            elementObj.entryKey = entryKey;
            elementObj.prev = entryKey.slice(0, lastSlashIndex + 1);
            elementObj.last = entryKey.slice(lastSlashIndex + 1, entryKeyQuery);
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

  // list all venus project
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

  // list all modules wthin spcified project
  public listVenusModules(projectName: string): ModuleWebpackEntries[] {
    const projectPath = path.resolve(defaultWorkspace, projectName);
    if (!this.isVenusProject(projectPath)) { return []; }
    return this.getWebpackEntry(projectName);
  }

  public buildProjectModuleMap(): ProjectModuleMapping[] {
    const venusProjects = this.listVenusProject();
    return venusProjects.map((projectName: string) => {
      return {
        projectName,
        active: false,
        modules: this.listVenusModules(projectName)
      };
    }).sort((a, b) => {
      const nameA = a.projectName.toLowerCase();
      const nameB = b.projectName.toLowerCase();
      if (nameA < nameB) {
        return -1;
      } else if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
  }
}
