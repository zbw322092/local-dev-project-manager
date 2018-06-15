import * as React from 'react';
import * as path from 'path';
import * as fs from 'fs';
import WelcomePage from './WelcomePage';
import { defaultWorkspace } from '../common/paths';
import { exec } from 'child_process';

interface ProjectMainPanelProps {
  showWelcomePage: boolean;
  formatProjectEntries: { prev: string, last: string, entryPath: string };
  projectName: string;
}

export default class ProjectMainPanel extends React.Component<ProjectMainPanelProps, any> {
  constructor(props: ProjectMainPanelProps, context: any) {
    super(props, context);

    this.state = {
      showWelcomePage: true,
      formatProjectEntries: []
    };
  }

  public static getDerivedStateFromProps(nextProps: any, prevState: any) {
    if (nextProps.showWelcomePage !== prevState.showWelcomePage ||
      nextProps.formatProjectEntries.length !== prevState.formatProjectEntries.length ||
      nextProps.projectName !== prevState.projectName
    ) {
      return {
        showWelcomePage: nextProps.showWelcomePage,
        formatProjectEntries: nextProps.formatProjectEntries,
        projectName: nextProps.projectName
      };
    }

    return null;
  }

  public openProjectVsCode = (entryPath: string) => {
    const targetprojectPath = path.resolve(defaultWorkspace, this.state.projectName);
    const targetModulePath = path.resolve(defaultWorkspace, this.state.projectName, entryPath);
    if (!fs.existsSync(targetModulePath)) { throw new Error('module entry not exists'); }

    exec(`code ${targetprojectPath} ${targetModulePath}`);
  }

  public render() {
    return (
      <div className="manager-panel">
        {
          this.state.showWelcomePage ? <WelcomePage /> :
            (
              <div className="panel-content">
                <div className="action-panel">
                  <button className="action-serve">Serve</button>
                  <button className="action-build">Build</button>
                  <button className="action-publish-inte">Publish Inte</button>
                  <button className="action-publish-prod">Publish Prod</button>
                  <button className="action-zip">Zip</button>
                </div>
                <div className="modules-list">
                  {
                    this.state.formatProjectEntries.map((entry: { prev: string, last: string, entryPath: string }, index: number) => {
                      return (
                        <div key={index} className="module">
                          <div className="module-icon" onClick={this.openProjectVsCode.bind(this, entry.entryPath)} />
                          <div className="module-name">
                            <span className="first-half">{entry.prev}</span>
                            {
                              entry.last === '' ? null : <span className="last-half">{entry.last}</span>
                            }
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              </div>
            )
        }

      </div>
    );
  }
}