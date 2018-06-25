import * as React from 'react';
import FuseSearch from './FuseSearch';
import { FuseOptions } from 'fuse.js';
import { ProjectModuleMapping } from './DirectoryScanner';

interface HeaderProps {
  projectModuleStructure: ProjectModuleMapping[];
  searchResultHandler: (newState: any) => any;
}

export default class Header extends React.Component<HeaderProps, any> {
  constructor(props: HeaderProps) {
    super(props);
  }

  public searchOptions: FuseOptions = {
    caseSensitive: false,
    shouldSort: true,
    findAllMatches: true,
    includeScore: true,
    includeMatches: true,
    threshold: 0.5,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 2,
    keys: ['projectName', 'modules.entryKey']
  };

  public render() {
    return (
      <div className="manager-header">
        <div className="manager-title">Local Dev Project Manager</div>
        <FuseSearch
          searchData={this.props.projectModuleStructure}
          searchOptions={this.searchOptions}
          searchResultHandler={this.props.searchResultHandler}
        />
      </div>
    );
  }
}