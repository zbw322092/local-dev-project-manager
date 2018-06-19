import * as React from 'react';
import { DirectoryScanner } from './DirectoryScanner';
import Headers from './Header';
import ProjectMainPanel from './ProjectMainPanel';

export default class App extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    this.directoryScanner = new DirectoryScanner();
    const venusProjects = this.directoryScanner.listVenusProject();
    const venusProjectsList = venusProjects.map((project, index) => {
      return {
        name: project,
        active: false
      };
    });

    this.state = {
      venusProjectsList,
      projectEntries: [],
      formatProjectEntries: [],
      showWelcomePage: true,
      activeProjectName: ''
    };
  }
  private directoryScanner: DirectoryScanner;

  public selectProject = (projectName: string, index: number) => {
    const projectEntries = this.directoryScanner.listVenusModules(projectName).sort();
    this.state.venusProjectsList.forEach((v: any, k: number) => {
      if (k === index) {
        return v.active = true;
      }
      return v.active = false;
    });
    console.log(projectEntries);

    const formatProjectEntries = projectEntries.map((entry: { entryKey: string, entryValue: string; }) => {
      const lastSlashIndex = entry.entryKey.lastIndexOf('/');
      const entryKeyQuery = entry.entryKey.indexOf('?') === -1 ? undefined : entry.entryKey.indexOf('?');
      return {
        entryKey: entry.entryKey,
        prev: entry.entryKey.slice(0, lastSlashIndex + 1),
        last: entry.entryKey.slice(lastSlashIndex + 1, entryKeyQuery),
        entryPath: entry.entryValue
      };
    });
    this.setState({
      venusProjectsList: this.state.venusProjectsList,
      formatProjectEntries,
      showWelcomePage: false,
      activeProjectName: projectName
    });
  }

  public render() {
    return (
      <div className="manager-wrapper">
        <Headers />
        <div className="manager-container">
          <div className="side-bar">
            {
              this.state.venusProjectsList.map((project: any, index: number) => {
                return (
                  <div className={`project ${project.active ? 'active-project' : ''}`} key={index}>
                    <div className="project-name"
                      onClick={this.selectProject.bind(this, project.name, index)}>{project.name}</div>
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