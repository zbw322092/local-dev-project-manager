import * as React from 'react';
import { DirectoryScanner } from './DirectoryScanner';
import Headers from './Header';
import ProjectMainPanel from './ProjectMainPanel';

export default class App extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    this.directoryScanner = new DirectoryScanner();
    const projectModuleStructure = this.directoryScanner.buildProjectModuleMap();
    console.log('projectModuleStructure: ', projectModuleStructure);

    this.state = {
      projectModuleStructure,
      projectEntries: [],
      formatProjectEntries: [],
      showWelcomePage: true,
      activeProjectName: ''
    };
  }
  private directoryScanner: DirectoryScanner;

  public selectProject = (projectName: string, index: number) => {
    this.state.projectModuleStructure.forEach((v: any, k: number) => {
      if (k === index) {
        return v.active = true;
      }
      return v.active = false;
    });

    const selectedProjectModule = this.state.projectModuleStructure[index] || [];
    this.setState({
      formatProjectEntries: selectedProjectModule.modules,
      showWelcomePage: false,
      activeProjectName: projectName
    });
  }

  public searchResultHandler = (newStates: any): void => {
    this.setState(newStates);
  }

  public render() {
    return (
      <div className="manager-wrapper">
        <Headers
          projectModuleStructure={this.state.projectModuleStructure}
          searchResultHandler={this.searchResultHandler}
        />
        <div className="manager-container">
          <div className="side-bar">
            {
              this.state.projectModuleStructure.map((project: any, index: number) => {
                return (
                  <div className={`project ${project.active ? 'active-project' : ''}`} key={index}>
                    <div className="project-name"
                      onClick={this.selectProject.bind(this, project.projectName, index)}>{project.projectName}</div>
                  </div>
                );
              })
            }
          </div>
          <ProjectMainPanel
            projectName={this.state.activeProjectName}
            showWelcomePage={this.state.showWelcomePage}
            formatProjectEntries={this.state.formatProjectEntries}
          />
        </div>
      </div>
    );
  }
}