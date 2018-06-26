import * as React from 'react';
import { FuseOptions } from 'fuse.js';
import * as Fuse from 'fuse.js';
import { ProjectModuleMapping, ModuleWebpackEntries } from './DirectoryScanner';
import { deepClone } from '../common/deepClone';

interface FuseSearchProps {
  searchData: ProjectModuleMapping[];
  searchOptions: FuseOptions;
  className?: string;
  searchResultHandler: (newState: any) => any;
}

interface MatchesProps {
  arrayIndex?: number;
  indices: Array<[number, number]>;
  key: string;
  value: string;
}

interface SearchResult {
  item: ProjectModuleMapping;
  matches: MatchesProps[];
}

export default class FuseSearch extends React.Component<FuseSearchProps, any> {

  constructor(props: FuseSearchProps, context: any) {
    super(props, context);

    this.searchData = JSON.parse(JSON.stringify(props.searchData));
    this.fuse = new Fuse(this.searchData, props.searchOptions);
  }
  private fuse: Fuse;
  private searchData: ProjectModuleMapping[];

  private stringInsert(originStr: string, positions: number[][]): string {
    const strLen = originStr.length;
    const spanTagBegin = '<span class="search-match">';
    const spanTagClosing = '</span>';
    let posArr: number[] = [];
    positions.forEach((pos) => {
      console.log(`pos ${pos}`);
      pos[1] = pos[1] + 1;
      posArr = posArr.concat(pos);
    });
    let highlightFromBegin = true;
    if (posArr[0] !== 0) {
      posArr.unshift(0);
      highlightFromBegin = false;
    }
    if (posArr[strLen - 1] !== strLen) { posArr.push(strLen); }

    console.log(`posArr: ${posArr}`);
    const posArrLen = posArr.length;
    const newPosArr: string[] = [];
    posArr.forEach((pos, index, arr) => {
      if (index === posArrLen - 1) { return; }
      if (highlightFromBegin) {
        if (index % 2 === 0) {
          newPosArr.push(spanTagBegin + originStr.slice(pos, arr[index + 1]) + spanTagClosing);
        } else {
          newPosArr.push(originStr.slice(pos, arr[index + 1]));
        }
      } else {
        if (index % 2 === 0) {
          newPosArr.push(originStr.slice(pos, arr[index + 1]));
        } else {
          newPosArr.push(spanTagBegin + originStr.slice(pos, arr[index + 1]) + spanTagClosing);
        }
      }
    });
    console.log(`newPosArr ${newPosArr.join('')}`);
    return newPosArr.join('');
  }

  public projectSearch = (e: any) => {
    const value = e.target.value;
    console.log(value);
    if (value === '') {
      return this.props.searchResultHandler({
        projectModuleStructure: this.searchData,
        activeProjectIndex: 0
      });
    }
    const searchResult: SearchResult[] = this.fuse.search(value);
    console.log(searchResult);
    const clonedSearchResult: SearchResult[] = deepClone(searchResult);

    const newProjectModules: ProjectModuleMapping[] = [];
    clonedSearchResult.forEach((result, index: number, arr) => {
      const projectModuleitem = result.item;
      const matches = result.matches;
      if (!matches.length) { return; }
      let macthedModules: ModuleWebpackEntries[] = [];
      matches.forEach((match, i) => {
        if (match.key === 'projectName') {
          const matchValue = this.stringInsert(match.value, match.indices);
          projectModuleitem.projectName = matchValue;
        } else if (match.key === 'modules.entryKey') {
          const matchValue = this.stringInsert(match.value, match.indices);
          if (match.arrayIndex !== undefined) {
            projectModuleitem.modules[match.arrayIndex].highlight = matchValue;
            macthedModules.push(projectModuleitem.modules[match.arrayIndex]);
          }
        }
      });
      if (!macthedModules.length) {
        macthedModules = projectModuleitem.modules;
      }
      projectModuleitem.modules = macthedModules;

      newProjectModules.push(projectModuleitem);
    });

    const stateObj = {
      projectModuleStructure: newProjectModules
    };
    if (newProjectModules.length) {
      Object.assign(stateObj, {
        showWelcomePage: false,
        activeProjectIndex: 0
      });
    }

    this.props.searchResultHandler(stateObj);
  }

  public render() {
    return (
      <div className={`fuse-search ${this.props.className || ''}`}>
        <input id="fuseSearch" type="text" placeholder="search project and module"
          onInput={this.projectSearch} />
      </div>
    );
  }
}