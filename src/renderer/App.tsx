import * as React from 'react';
import { DirectoryScanner, ProjectModuleMapping } from './DirectoryScanner';
import Headers from './Header';
import ProjectMainPanel from './ProjectMainPanel';

export default class App extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    this.directoryScanner = new DirectoryScanner();
    this.projectModuleStructure = this.directoryScanner.buildProjectModuleMap();

    this.state = {
      projectModuleStructure: this.projectModuleStructure,
      showWelcomePage: true,
      activeProjectIndex: 0
    };
  }
  private directoryScanner: DirectoryScanner;
  private projectModuleStructure: ProjectModuleMapping[];

  public selectProject = (projectName: string, index: number) => {
    this.setState({
      activeProjectIndex: index,
      showWelcomePage: false
    });
  }

  public searchResultHandler = (newStates: any): void => {
    this.setState(newStates);
  }

  public render() {
    const activeIndex = this.state.activeProjectIndex;
    const projectModuleStructure = this.state.projectModuleStructure;
    const activeProject = projectModuleStructure[activeIndex] || [];

    return (
      <div className="manager-wrapper">
        <Headers
          projectModuleStructure={this.projectModuleStructure}
          searchResultHandler={this.searchResultHandler}
        />
        <div className="manager-container">
          <div className="side-bar">
            {
              this.state.projectModuleStructure.map((project: any, index: number) => {
                return (
                  <div className={`project ${index === activeIndex ? 'active-project' : ''}`} key={index}>
                    <div className="project-name"
                      onClick={() => { this.selectProject(project.projectName, index); }}
                      dangerouslySetInnerHTML={{ __html: project.projectName }}></div>
                  </div>
                );
              })
            }
          </div>
          <ProjectMainPanel
            projectName={activeProject.projectName || ''}
            showWelcomePage={this.state.showWelcomePage}
            formatProjectEntries={activeProject.modules || []}
          />
        </div>
      </div>
    );
  }
}