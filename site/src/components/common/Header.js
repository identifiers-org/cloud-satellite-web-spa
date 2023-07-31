import React from 'react';
import { connect } from 'react-redux';
import { NavLink as BaseNavLink } from 'react-router-dom';

const identifiersLogo = new URL('../../assets/identifiers_logo.png', import.meta.url);

import Sticky from './Sticky';
import EBINavBar from './EBINavBar';
import EBINavItem from './EBINavItem';
import EBINavDropDown from './EBINavDropDown'

// This code was written for v5 and code adjusts v6 to have the same behavious as v5
// https://reactrouter.com/en/main/components/nav-link
const NavLink = React.forwardRef(
  ({ activeClassName, activeStyle, ...props }, ref) => {
    return (
      <BaseNavLink
        ref={ref}
        {...props}
        className={({ isActive }) =>
          [
            props.className,
            isActive ? activeClassName : null,
          ]
            .filter(Boolean)
            .join(" ")
        }
        style={({ isActive }) => ({
          ...props.style,
          ...(isActive ? activeStyle : null),
        })}
      />
    );
  }
);

class Header extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    ebiFrameworkPopulateBlackBar();
    ebiFrameworkActivateBlackBar();
    ebiFrameworkExternalLinks();
    ebiFrameworkManageGlobalSearch();
    ebiFrameworkSearchNullError();
    ebiFrameworkHideGlobalNav();
    ebiFrameworkAssignImageByMetaTags();
    ebiFrameworkInsertEMBLdropdown();
  }

  render() {
    const { config } = this.props;

    return (
      // This is EMBL-EBI Enforced boilerplate header.
      <>
        <header id="masthead-black-bar" className="clearfix masthead-black-bar expanded">
        </header>

        <div id="content">
          <div data-sticky-container>
            <div id="masthead" className="masthead" data-sticky data-sticky-on="large" data-top-anchor="main-content-area:top" data-btm-anchor="main-content-area:bottom">
              <div className="masthead-inner row expanded">
                <div className="columns medium-12" id="local-title">
                  <div className="d-flex ml-3 mb-2">
                    <img src={identifiersLogo} />
                    <div className="logo-text">
                      <h1>Identifiers.org</h1>
                      <p className="logo-subtitle">Resolution service</p>
                    </div>
                  </div>
                </div>

                <div className="sticky-placeholder">
                  <Sticky>
                    <EBINavBar>
                      <EBINavItem className="nav-item">
                        <NavLink to="/" className="nav-link nav-link-dark" activeClassName="active">
                          <i className="icon icon-common icon-external-link-alt" /> Resolution
                        </NavLink>
                      </EBINavItem>

                      <EBINavItem className="nav-item">
                        <a href={config.registryUrl} className="nav-link nav-link-dark">
                          <i className="icon icon-common icon-list" /> Registry
                        </a>
                      </EBINavItem>

                      <EBINavItem className="nav-item">
                        <a href={`${config.registryUrl}/registry`} className="nav-link nav-link-dark">
                          <i className="icon icon-common icon-search" /> Browse the registry
                        </a>
                      </EBINavItem>

                      <EBINavDropDown
                        caption={<span><i className="icon icon-common icon-hand-point-up mr-1" />Make a request</span>}
                      >
                        <EBINavItem className="nav-item">
                          <a href={`${config.registryUrl}/prefixregistrationrequest`} className="nav-link nav-link-dark">
                            <i className="icon icon-common icon-leaf mr-1" />Request prefix
                          </a>
                        </EBINavItem>
                        <EBINavItem className="nav-item">
                          <a href={`${config.registryUrl}/resourceregistrationrequest`} className="nav-link nav-link-dark">
                            <i className="icon icon-common icon-cube mr-1" />Request resource
                          </a>
                        </EBINavItem>
                      </EBINavDropDown>

                      <EBINavItem className="nav-item">
                        <a href={config.documentationUrl} className="nav-link nav-link-dark">
                          <i className="icon icon-common icon-documentation" /> Documentation
                        </a>
                      </EBINavItem>

                      <EBINavItem className="nav-item float-right">
                        <a href={config.feedbackUrl} target="_blank" className="nav-link nav-link-dark">
                          <i className="icon icon-common icon-comments" /> Feedback
                        </a>
                      </EBINavItem>
                    </EBINavBar>
                  </Sticky>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}


// Redux mappings.
const mapStateToProps = (state) => ({
  config: state.config
});

export default connect(mapStateToProps)(Header);
