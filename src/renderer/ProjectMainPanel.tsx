import * as React from 'react';
import * as path from 'path';
import * as fs from 'fs';
import WelcomePage from './WelcomePage';
import { defaultWorkspace } from '../common/paths';
import { exec, ChildProcess } from 'child_process';
import { StringDecoder } from 'string_decoder';
import { ModuleWebpackEntries } from './DirectoryScanner';
const decoder = new StringDecoder('utf8');

interface ProjectMainPanelProps {
  showWelcomePage: boolean;
  formatProjectEntries: ModuleWebpackEntries[];
  projectName: string;
}

type VenusCmdType = 'build' | 'publishInte' | 'publishProd' | 'zip';

declare global {
  interface Window {
    Notification: any;
  }
}

export default class ProjectMainPanel extends React.Component<ProjectMainPanelProps, any> {
  constructor(props: ProjectMainPanelProps, context: any) {
    super(props, context);

    this.state = {
      showWelcomePage: true,
      formatProjectEntries: [],
      selectEntryPaths: [],
      buildingSelected: false,
      publishingInteSelected: false,
      publishingProdSelected: false,
      zippingSelected: false
    };
  }

  public static getDerivedStateFromProps(nextProps: any, prevState: any) {
    return {
      showWelcomePage: nextProps.showWelcomePage,
      formatProjectEntries: nextProps.formatProjectEntries
    };
  }

  public openProjectVsCode = (entryPath: string) => {
    const targetprojectPath = path.resolve(defaultWorkspace, this.props.projectName);
    const targetModulePath = path.resolve(defaultWorkspace, this.props.projectName, entryPath);
    if (!fs.existsSync(targetModulePath)) { throw new Error('module entry not exists'); }

    exec(`code ${targetprojectPath} ${targetModulePath}`);
  }

  public operationNotification(title: string, body: string): any {
    const notificationConfig = {
      title, body
    };
    return new Notification(notificationConfig.title, notificationConfig);
  }

  public selectedModules: string[] = [];
  public checkboxChange = (entryKey: string, e: any) => {
    const checked = e.target.checked;
    if (checked) {
      this.selectedModules.push(entryKey);
    } else {
      this.selectedModules.forEach((entry: string, index: number) => {
        if (entry === entryKey) {
          this.selectedModules.splice(index, 1);
        }
      });
    }
  }

  public operate = (cmdType: VenusCmdType, mutiModules: boolean, entryKey: string | undefined, stateName: string, finishCb?: () => any) => {
    if (mutiModules && !this.selectedModules.length) {
      // TODO. alert some info to user
      console.log('no module selected');
      return;
    } else if (this.state[stateName]) {
      console.log('under working');
      return;
    }
    const stateObj = {} as any;
    stateObj[stateName] = true;
    this.setState(stateObj);
    const cwdPath = path.resolve(defaultWorkspace, this.props.projectName) + '/';
    let cmd: string = '';
    if (cmdType === 'build') {
      cmd = `cd ${cwdPath} && venus build -m "${mutiModules ? this.selectedModules.join() : entryKey}"`;
    } else if (cmdType === 'publishInte') {
      cmd = `cd ${cwdPath} && venus publish -m "${mutiModules ? this.selectedModules.join() : entryKey}" -f="all"`;
    } else if (cmdType === 'publishProd') {
      cmd = `cd ${cwdPath} && venus publish -m "${mutiModules ? this.selectedModules.join() : entryKey}" -f="assets" -e="prod"`;
    } else if (cmdType === 'zip') {
      cmd = `cd ${cwdPath} && venus zip -m "${mutiModules ? this.selectedModules.join() : entryKey}"`;
    }

    const execProcess = exec(cmd);
    console.log('execting: ', cmd);

    execProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${decoder.write(data as Buffer)}`);
      const isConfirmPropmt = data.toString().includes('Please confirm above modules you could like');
      if (isConfirmPropmt) {
        (execProcess as ChildProcess).stdin.write('\n');
      }
    });

    execProcess.on('exit', () => {
      stateObj[stateName] = false;
      this.setState(stateObj, () => {
        const notificationConfig: { title: string; body: string } = { title: '', body: '' };
        if (cmdType === 'build') {
          notificationConfig.title = 'build success';
          notificationConfig.body = mutiModules ?
            `${this.selectedModules.join()} modules have built successfully` :
            `${entryKey} has built successfully`;
          console.log('build finish');
        } else if (cmdType === 'publishInte') {
          notificationConfig.title = 'publish inte success';
          notificationConfig.body = mutiModules ?
            `${this.selectedModules.join()} modules have published inte successfully` :
            `${entryKey} has published inte successfully`;
          console.log('publish inte finish');
        } else if (cmdType === 'publishProd') {
          notificationConfig.title = 'publish prod success';
          notificationConfig.body = mutiModules ?
            `${this.selectedModules.join()} modules have published prod successfully` :
            `${entryKey} has published prod successfully`;
          console.log('publish prod finish');
        } else if (cmdType === 'zip') {
          notificationConfig.title = 'zip success';
          notificationConfig.body = mutiModules ?
            `${this.selectedModules.join()} modules have zipped successfully` :
            `${entryKey} has zipped successfully`;
          console.log('zip finish');
        }

        this.operationNotification(notificationConfig.title, notificationConfig.body);

        if (typeof finishCb === 'function') { finishCb(); }
      });
    });
  }

  public renderMainPanel() {
    return (
      <div className="panel-content">
        <div className="muti-module-action">
          <button className={`action-build ${this.state.buildingSelected ? 'working' : ''}`}
            onClick={() => this.operate('build', true, undefined, 'buildingSelected')}>
            {
              this.state.buildingSelected ? <div className="working-loading"></div> : <div>Build Selected</div>
            }
          </button>

          <button className={`action-publish-inte ${this.state.publishingInteSelected ? 'working' : ''}`}
            onClick={() => this.operate('publishInte', true, undefined, 'publishingInteSelected')}>
            {
              this.state.publishingInteSelected ? <div className="working-loading"></div> : <div>Publish Inte Selected</div>
            }
          </button>

          <button className={`action-publish-prod ${this.state.publishingProdSelected ? 'working' : ''}`}
            onClick={() => this.operate('publishProd', true, undefined, 'publishingProdSelected')}>
            {
              this.state.publishingProdSelected ? <div className="working-loading"></div> : <div>Publish Prod Selected</div>
            }
          </button>

          <button className={`action-zip ${this.state.zippingSelected ? 'working' : ''}`}
            onClick={() => this.operate('zip', true, undefined, 'zippingSelected')}>
            {
              this.state.zippingSelected ? <div className="working-loading"></div> : <div>Zip Selected</div>
            }
          </button>
        </div>
        <div className="modules-list">
          {
            this.state.formatProjectEntries.map((entry: ModuleWebpackEntries, index: number) => {
              console.log('modules change');
              // const serveStateKey = `${index}-serve`;
              const buildStateKey = `${index}-build`;
              const pubInteStateKey = `${index}-publish-inte`;
              const pubProdStateKey = `${index}-publish-prod`;
              const zipStateKey = `${index}-zip`;
              return (
                <div key={index} className="module">
                  <div className="module-icon" onClick={this.openProjectVsCode.bind(this, entry.entryValue)} />
                  <div className="module-name">
                    {
                      entry.highlight ?
                        <span className="last-half" dangerouslySetInnerHTML={{ __html: entry.highlight }} /> :
                        (
                          <span>
                            <span className="first-half">{entry.prev}</span>
                            {
                              entry.last === '' ? null : <span className="last-half">{entry.last}</span>
                            }
                          </span>
                        )
                    }
                  </div>
                  <input type="checkbox" onChange={this.checkboxChange.bind(this, entry.entryKey)} />
                  <div className="module-action">
                    {/* <button className={`action-serve ${this.state[serveStateKey] ? 'working' : ''}`}
                      onClick={this.operateServe.bind(this, entry.entryKey, serveStateKey)}>
                      {
                        this.state[serveStateKey] ? <div className="working-loading"></div> : <div>Serve</div>
                      }
                    </button> */}

                    <button className={`action-build ${this.state[buildStateKey] ? 'working' : ''}`}
                      onClick={() => this.operate('build', false, entry.entryKey, buildStateKey)}>
                      {
                        this.state[buildStateKey] ? <div className="working-loading"></div> : <div>Build</div>
                      }
                    </button>

                    <button className={`action-publish-inte ${this.state[pubInteStateKey] ? 'working' : ''}`}
                      onClick={() => this.operate('publishInte', false, entry.entryKey, pubInteStateKey)} >
                      {
                        this.state[pubInteStateKey] ? <div className="working-loading"></div> : <div>Publish Inte</div>
                      }
                    </button>

                    <button className={`action-publish-prod ${this.state[pubProdStateKey] ? 'working' : ''}`}
                      onClick={() => this.operate('publishProd', false, entry.entryKey, pubProdStateKey)}>
                      {
                        this.state[pubProdStateKey] ? <div className="working-loading"></div> : <div>Publish Prod</div>
                      }
                    </button>

                    <button className={`action-zip ${this.state[zipStateKey] ? 'working' : ''}`}
                      onClick={() => this.operate('zip', false, entry.entryKey, zipStateKey)}>
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