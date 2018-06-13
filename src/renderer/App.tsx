import * as React from 'react';
import { DirectoryScanner } from './DirectoryScanner';

export default class App extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    const directoryScanner = new DirectoryScanner();
    const venusProjects = directoryScanner.listVenusProject();

    this.state = {
      venusProjects
    };
  }

  public render() {
    return (
      <div className="manager-wrapper">
        <div className="manager-title">Local Dev Project Manager</div>
        {
          this.state.venusProjects.map((project: string, index: number) => {
            return (
              <div key={index} className="project">
                <div className="project-icon" />
                <div className="project-name">{project}</div>
                <div className="project-terminal" />
                <div className="action-panel">
                  <button className="action-serve">Serve</button>
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
    );
  }
}