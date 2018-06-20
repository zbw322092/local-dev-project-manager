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

  // serve module
  public operateServe = (entryKey: string, stateProps: string): void => {
    if (this.state[stateProps]) { return; } // if operation is working, return;
    const stateObj = {} as any;
    stateObj[stateProps] = true;
    this.setState(stateObj);

    const cwdPath = path.resolve(defaultWorkspace, this.state.projectName) + '/';
    const execServeProcess = exec(`cd ${cwdPath} && venus serve -m "${entryKey}"`);

    execServeProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${decoder.write(data as Buffer)}`);
      const isConfirmPropmt = data.toString().includes('Please confirm above modules you could like? (Y/n)');
      if (isConfirmPropmt) {
        execServeProcess.stdin.write('\n');
      }
    });

    setTimeout(() => {
      execServeProcess.kill();
    }, 60000);

    execServeProcess.on('exit', () => {
      stateObj[stateProps] = false;
      this.setState(stateObj);
      console.log('serve down');
    });
  }

  // build module
  public operateBuild = (entryKey: string, stateProps: string): void => {
    if (this.state[stateProps]) { return; } // if operation is working, return;
    const stateObj = {} as any;
    stateObj[stateProps] = true;
    this.setState(stateObj);

    const cwdPath = path.resolve(defaultWorkspace, this.state.projectName) + '/';
    const execBuildProcess = exec(`cd ${cwdPath} && venus build -m "${entryKey}"`);

    execBuildProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${decoder.write(data as Buffer)}`);
      const isConfirmPropmt = data.toString().includes('Please confirm above modules you could like');
      if (isConfirmPropmt) {
        execBuildProcess.stdin.write('\n');
      }
    });

    execBuildProcess.on('exit', () => {
      stateObj[stateProps] = false;
      this.setState(stateObj);
      console.log('build finish');
    });
  }

  // publish code to inte env
  public operatePublishInte = (entryKey: string, stateProps: string): void => {
    if (this.state[stateProps]) { return; } // if operation is working, return;
    const stateObj = {} as any;
    stateObj[stateProps] = true;
    this.setState(stateObj);

    const cwdPath = path.resolve(defaultWorkspace, this.state.projectName) + '/';
    const execPublishInteProcess = exec(`cd ${cwdPath} && venus publish -m "${entryKey}" -f="all"`);

    execPublishInteProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${decoder.write(data as Buffer)}`);
      const isConfirmPropmt = data.toString().includes('Please confirm above modules you could like');
      if (isConfirmPropmt) {
        execPublishInteProcess.stdin.write('\n');
      }
    });

    execPublishInteProcess.on('exit', () => {
      stateObj[stateProps] = false;
      this.setState(stateObj);
      console.log('publish inte finish');
    });
  }

  // publish assets to prod env
  public operatePublishProd = (entryKey: string, stateProps: string): void => {
    if (this.state[stateProps]) { return; } // if operation is working, return;
    const stateObj = {} as any;
    stateObj[stateProps] = true;
    this.setState(stateObj);

    const cwdPath = path.resolve(defaultWorkspace, this.state.projectName) + '/';
    const execPublishProdProcess = exec(`cd ${cwdPath} && venus publish -m "${entryKey}" -f="assets" -e="prod"`);

    execPublishProdProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${decoder.write(data as Buffer)}`);
      const isConfirmPropmt = data.toString().includes('Please confirm above modules you could like');
      if (isConfirmPropmt) {
        execPublishProdProcess.stdin.write('\n');
      }
    });

    execPublishProdProcess.on('exit', () => {
      stateObj[stateProps] = false;
      this.setState(stateObj);
      console.log('publish prod finish');
    });
  }

  // zip module
  public operateZip = (entryKey: string, stateProps: string): void => {
    if (this.state[stateProps]) { return; } // if operation is working, return;
    const stateObj = {} as any;
    stateObj[stateProps] = true;
    this.setState(stateObj);

    const cwdPath = path.resolve(defaultWorkspace, this.state.projectName) + '/';
    const execPublishProdProcess = exec(`cd ${cwdPath} && venus zip -m "${entryKey}"`);

    execPublishProdProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${decoder.write(data as Buffer)}`);
      const isConfirmPropmt = data.toString().includes('Please confirm above modules you could like');
      if (isConfirmPropmt) {
        execPublishProdProcess.stdin.write('\n');
      }
    });

    execPublishProdProcess.on('exit', () => {
      stateObj[stateProps] = false;
      this.setState(stateObj);
      console.log('zip finish');
    });
  }

  public renderMainPanel() {
    return (
      <div className="panel-content">
        <div className="modules-list">
          {
            this.state.formatProjectEntries.map((entry: { entryKey: string, prev: string, last: string, entryPath: string }, index: number) => {
              const serveStateKey = `${index}-serve`;
              const buildStateKey = `${index}-build`;
              const pubInteStateKey = `${index}-publish-inte`;
              const pubProdStateKey = `${index}-publish-prod`;
              const zipStateKey = `${index}-zip`;
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
                    <button className={`action-serve ${this.state[serveStateKey] ? 'working' : ''}`}
                      onClick={this.operateServe.bind(this, entry.entryKey, serveStateKey)}>
                      {
                        this.state[serveStateKey] ? <div className="working-loading"></div> : <div>Serve</div>
                      }
                    </button>

                    <button className={`action-build ${this.state[buildStateKey] ? 'working' : ''}`}
                      onClick={this.operateBuild.bind(this, entry.entryKey, buildStateKey)}>
                      {
                        this.state[buildStateKey] ? <div className="working-loading"></div> : <div>Build</div>
                      }
                    </button>

                    <button className={`action-publish-inte ${this.state[pubInteStateKey] ? 'working' : ''}`}
                      onClick={this.operatePublishInte.bind(this, entry.entryKey, pubInteStateKey)}>
                      {
                        this.state[pubInteStateKey] ? <div className="working-loading"></div> : <div>Publish Inte</div>
                      }
                    </button>

                    <button className={`action-publish-prod ${this.state[pubProdStateKey] ? 'working' : ''}`}
                      onClick={this.operatePublishInte.bind(this, entry.entryKey, pubProdStateKey)}>
                      {
                        this.state[pubProdStateKey] ? <div className="working-loading"></div> : <div>Publish Prod</div>
                      }
                    </button>

                    <button className={`action-zip ${this.state[zipStateKey] ? 'working' : ''}`}
                      onClick={this.operateZip.bind(this, entry.entryKey, zipStateKey)}>
                      {
                        this.state[zipStateKey] ? <div className="working-loading"></div> : <div>Zip</div>
                      }
                    </button>
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }

  public render() {
    return (
      <div className="manager-panel">
        {
          this.state.showWelcomePage ? <WelcomePage /> : this.renderMainPanel()
        }

      </div>
    );
  }
}