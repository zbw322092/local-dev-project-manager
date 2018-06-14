import * as React from 'react';
import { DirectoryScanner } from './DirectoryScanner';
import Headers from './Header';
import WelcomePage from './WelcomePage';

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
      showWelcomePage: true
    };
  }
  private directoryScanner: DirectoryScanner;

  public selectProject = (projectName: string, index: number) => {
    const projectEntries = this.directoryScanner.listVenusModules(projectName);
    this.state.venusProjectsList.forEach((v: any, k: number) => {
      if (k === index) {
        return v.active = true;
      }
      return v.active = false;
    });
    console.log(projectEntries);
    this.setState({
      venusProjectsList: this.state.venusProjectsList,
      projectEntries,
      showWelcomePage: false
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
          <div className="manager-panel">
            {
              this.state.showWelcomePage ? <WelcomePage /> :
                (
                  <div className="panel-content">
                    <div className="action-panel">
                      {/* <div className="project-icon" />
                      <div className="project-terminal" /> */}
                      <button className="action-serve">Serve</button>
                      <button className="action-build">Build</button>
                      <button className="action-publish-inte">Publish Inte</button>
                      <button className="action-publish-prod">Publish Prod</button>
                      <button className="action-zip">Zip</button>
                    </div>
                    <div className="modules-list">
                      {
                        this.state.projectEntries.map((entry: string, index: number) => {
                          return <div className="module" key={index}>{ entry }</div>;
                        })
                      }
                    </div>
                  </div>
                )
            }

          </div>
        </div>
      </div>
    );
  }
}