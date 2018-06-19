import * as React from 'react';
import * as path from 'path';
import * as fs from 'fs';
import WelcomePage from './WelcomePage';
import { defaultWorkspace } from '../common/paths';
import { exec } from 'child_process';
import { StringDecoder } from 'string_decoder';
const decoder = new StringDecoder('utf8');

interface ProjectMainPanelProps {
  showWelcomePage: boolean;
  formatProjectEntries: { entryKey: string, prev: string, last: string, entryPath: string };
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

  public operateServe = (entryKey: string): void => {
    const cwdPath = path.resolve(defaultWorkspace, this.state.projectName) + '/';
    const execProcess = exec(`cd ${cwdPath} && venus serve -m "${entryKey}"`);

    Object.assign(process.stdout, {
      isTTY: true
    });
    Object.assign(execProcess.stdout, {
      isTTY: true
    });

    console.log('process.stdout pid: ', process.pid);
    console.log('execProcess.stdout pid: ', execProcess.pid);

    execProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${decoder.write(data as Buffer)}`);
      const isConfirmPropmt = data.toString().includes('Please confirm above modules you could like? (Y/n)');
      if (isConfirmPropmt) {
        execProcess.stdin.write('\n');
      }
    });

    setTimeout(() => {
      execProcess.kill();
    }, 60000);
  }

  public render() {
    return (
      <div className="manager-panel">
        {
          this.state.showWelcomePage ? <WelcomePage /> :
            (
              <div className="panel-content">
                <div className="modules-list">
                  {
                    this.state.formatProjectEntries.map((entry: { entryKey: string, prev: string, last: string, entryPath: string }, index: number) => {
                      return (
                        <div key={index} className="module">
                          <div className="module-icon" onClick={this.openProjectVsCode.bind(this, entry.entryPath)} />
                          <div className="module-name">
                            <span className="first-half">{entry.prev}</span>
                            {
                              entry.last === '' ? null : <span className="last-half">{entry.last}</span>
                            }
                          </div>
                          <div className="module-action">
                            <button className="action-serve" onClick={this.operateServe.bind(this, entry.entryKey)}>Serve</button>
                            <button className="action-build">Build</button>
                            <button className="action-publish-inte">Publish Inte</button>
                            <button className="action-publish-prod">Publish Prod</button>
                            <button className="action-zip">Zip</button>
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