import * as React from 'react';
import { FuseOptions } from 'fuse.js';
import * as Fuse from 'fuse.js';
import { ProjectModuleMapping } from './DirectoryScanner';

interface FuseSearchProps {
  searchData: any[];
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

    // this.fuse = new Fuse(this.removeHighlight(props.searchData), props.searchOptions);
  }
  // private fuse: Fuse;

  private removeHighlight (orginData: ProjectModuleMapping[]) {
    const regex = /<span className="search-match">|<\/span>/g;
    orginData.forEach((data) => {
      data.projectName = data.projectName.replace(regex, '');
      data.modules.forEach((m) => {
        m.entryKey = m.entryKey.replace(regex, '');
      });
    });

    console.log(`orginData: ${JSON.stringify(orginData)}`);
    return orginData;
  }

  private stringInsert(originStr: string, positions: number[][]): string {
    const strLen = originStr.length;
    const spanTagBegin = '<span class="search-match">';
    const spanTagClosing = '</span>';
    let posArr: number[] = [];
    positions.forEach((pos) => {
      console.log(`pos ${pos}`);
      posArr = posArr.concat(pos);
    });
    let highlightFromBegin = true;
    if (posArr[0] !== 0) {
      posArr.unshift(0);
      highlightFromBegin = false;
    }
    if (posArr[strLen - 1] !== strLen - 1) { posArr.push(strLen); }

    console.log(`posArr: ${posArr}`);
    const posArrLen = posArr.length;
    const newPosArr: string[] = [];
    posArr.forEach((pos, index, arr) => {
      if (index === posArrLen - 1) { return; }
      if (highlightFromBegin) {
        if (index % 2 === 0) {
          newPosArr.push(spanTagBegin + originStr.slice(pos, arr[index + 1] + 1) + spanTagClosing);
        } else {
          newPosArr.push(originStr.slice(pos + 1, arr[index + 1]));
        }
      } else {
        if (index % 2 === 0) {
          newPosArr.push(originStr.slice(pos + 1, arr[index + 1]));
        } else {
          newPosArr.push(spanTagBegin + originStr.slice(pos, arr[index + 1] + 1) + spanTagClosing);
        }
      }
    });
    console.log(`newPosArr ${newPosArr.join('')}`);
    return newPosArr.join('');
  }

  public projectSearch = (e: any) => {
    const value = e.target.value;
    console.log(value);
    const fuse = new Fuse(this.removeHighlight(this.props.searchData), this.props.searchOptions);
    // const searchResult: SearchResult[] = this.fuse.search(value);
    const searchResult: SearchResult[] = fuse.search(value);
    console.log(searchResult);
    const newProjectModules = searchResult.map((result, index: number) => {
      const matches = result.matches;
      matches.forEach((match) => {
        if (match.key === 'projectName') {
          const matchValue = this.stringInsert(match.value, match.indices);
          result.item.projectName = matchValue;
        }
      });

      return result.item;
    });

    // const newProjectModule = searchResult.map((result, index: number) => {
    //   return result.item;
    // });
    this.props.searchResultHandler({
      projectModuleStructure: newProjectModules
    });
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