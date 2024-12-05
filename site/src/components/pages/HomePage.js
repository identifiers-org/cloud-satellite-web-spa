import React from 'react';
import { config } from '../../config/Config'

// Components.
import Search from '../HomePage/Search';

// Utils.
import { isSmallScreen, isIpadScreen } from '../../utils/responsive';

import { useMatomo } from '@datapunt/matomo-tracker-react';
import { useNavigate } from "react-router-dom";


class HomePage extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { trackPageView } = this.props.matomo;
    trackPageView();
  }

  render() {
    const boxPadding = isSmallScreen() || isIpadScreen() ? 'p-3' : 'p-5';
    const searchBarPadding = isSmallScreen() ? 'p-1' : 'px-5';
    const topSpacer = isSmallScreen() ? '' : 'spacer-8';
    const { navigate } = this.props;

    return (
      <div className={`row border ${topSpacer}`}>
        <div className={`col col-12 col-xl-6 ${boxPadding}`}>
          <h1 className="text-primary mb-4">Identifiers.org Resolution Service</h1>
          <div className="d-flex">
            <p className="mb-0 text-justify text-muted">
              The Identifiers.org Resolution Service provides consistent access to life science data using Compact
              Identifiers. Compact Identifiers consist of an assigned unique prefix and a local provider designated
              accession number (prefix:accession). The resolving location of Compact Identifiers is determined using
              information that is stored in the Identifiers.org  <a
                href={config.registryUrl}
                className="text-primary"
              >
                Registry
              </a>.
            </p>
          </div>
        </div>

        <div className="col col-12 col-xl-6 bg-light">
          <h4 className={`mt-3 ${boxPadding}`}><i className="icon icon-common icon-search mr-2" />Resolve a Compact Identifier</h4>
          <div className={`row justify-content-center mt-2 ${searchBarPadding}`}>
            <div className="col col-lg-7 col-xl-12">
              <Search
                buttonCaption={<span><i className="icon icon-common icon-search mr-1" /> Resolve</span>}
                placeholderCaption="Enter an identifier to resolve"
                onButtonClick={(query) => navigate(`resolve?query=${query}`)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default (props) => {
  const matomo = useMatomo();
  const navigate = useNavigate();
  return <HomePage  {...props} matomo={matomo} navigate={navigate} />
};