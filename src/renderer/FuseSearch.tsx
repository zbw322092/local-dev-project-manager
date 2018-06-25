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

    this.fuse = new Fuse(props.searchData, props.searchOptions);
  }
  private fuse: Fuse;

  private stringInsert(originStr: string, firstInsert: string, secondInsert: string, positions: number[][]): string {
    const strLen = originStr.length;
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
          newPosArr.push(firstInsert + originStr.slice(pos, arr[index + 1]) + secondInsert);
        } else {
          newPosArr.push(originStr.slice(pos, arr[index + 1]));
        }
      } else {
        if (index % 2 === 0) {
          newPosArr.push(originStr.slice(pos, arr[index + 1]));
        } else {
          newPosArr.push(firstInsert + originStr.slice(pos, arr[index + 1]) + secondInsert);
        }
      }
    });
    console.log(newPosArr.join(''));
    return newPosArr.join('');
  }

  public projectSearch = (e: any) => {
    const value = e.target.value;
    console.log(value);
    const searchResult: SearchResult[] = this.fuse.search(value);
    console.log(searchResult);
    const spanTagBegin = '<span className="search-match">';
    const spanTagClosing = '</span>';
    const newProjectModules = searchResult.map((result, index: number) => {
      const matches = result.matches;
      matches.forEach((match) => {
        if (match.key === 'projectName') {
          const matchValue = this.stringInsert(match.value, spanTagBegin, spanTagClosing, match.indices);
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