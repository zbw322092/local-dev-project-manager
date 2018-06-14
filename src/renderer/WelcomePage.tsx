import * as React from 'react';

export default class WelcomePage extends React.Component {
  public render() {
    return (
      <div className="welcome-page">
        <div className="welcome-icon" />
        <div className="welcome-text">
          Venus is powerful, managing it.
        </div>
      </div>
    );
  }
}