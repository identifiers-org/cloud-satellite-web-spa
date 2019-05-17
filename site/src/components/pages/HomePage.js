import React from 'react';

import identifiersLogo from '../../assets/identifiers_logo.png';
import Search from '../homepage/Search';


class MainPage extends React.Component {
  constructor(props) {
    super(props);

    const params = new URLSearchParams(props.location.search);

    this.state = {
      query: params.get('query') || ''
    };
  }

  render() {
    const { query } = this.state;

    return (
        <>
          <div className="row justify-content-center">
            <div className="col col-5">
              <div className="logo">
                <img src={identifiersLogo} />
                <div className="logo-text">
                  <h1>Identifiers.org</h1>
                  <p className="logo-subtitle">Resolution service</p>
                </div>
              </div>
            </div>
          </div>
          <div className="row justify-content-center mt-2">
            <div className="col col-xs-12 col-sm-10 col-md-12 col-lg-6">
              <Search query={query} />
            </div>
          </div>
        </>
    );
  }
}


export default MainPage;