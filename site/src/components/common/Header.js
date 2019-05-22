import React from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';

import identifiersLogo from '../../assets/identifiers_logo.png';


class Header extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      navCollapsed: true
    };
  }


  handleToggleNav = () => {
    this.setState({navCollapsed: !this.state.navCollapsed});
  }

  render() {
    const {
      props: { config },
      state: { navCollapsed },
      handleToggleNav
    } = this;

    return (
      <header>
        <nav className="navbar navbar-expand-md navbar-light bg-light">

          <div className="navbar-brand">
            <div className="mb-0 header-logo">
              <img src={identifiersLogo} className="brand-img"/>
              <div className="logo-text">
                  <h1>Identifiers.org</h1>
                  <p className="logo-subtitle">Resolution service</p>
                </div>
            </div>
          </div>

          <button className="navbar-toggler" type="button" onClick={handleToggleNav}>
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className={`collapse navbar-collapse ${navCollapsed ? '' : 'show'}`}>
            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <NavLink exact to="/" className="nav-link" activeClassName="active">
                <i className="icon icon-common icon-home" /> Home
                </NavLink>
              </li>
              <li className="nav-item">
                <a href={config.registryUrl} className="nav-link">
                  <i className="icon icon-common icon-search" /> Registry
                </a>
              </li>
              <li className="nav-item">
                <a href={config.registryPrefixRegistrationRequestFormUrl} className="nav-link">
                  <i className="icon icon-common icon-hand-point-up" /> Request prefix
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </header>
    );
  }
}


// Redux mappings.
const mapStateToProps = (state) => ({
  config: state.config
});


export default connect(mapStateToProps)(Header);
