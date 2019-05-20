import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBomb } from '@fortawesome/free-solid-svg-icons';

import ResourceItem from './ResourceItem';


class ResourceList extends React.Component {
  constructor(props) {
    super(props);
  }


  render() {
    const {
      resolvedResources,
    } = this.props;

    const query = new URLSearchParams(this.props.location.search).get('query');

    return (
      resolvedResources.length === 0 ? (
        <>
          <div className="row mb-5">
            <div className="col align-middle">
              <FontAwesomeIcon icon={faBomb} size="2x" className="text-dark mr-2" />
              Error resolving compact identifier <strong>{query}</strong>.
            </div>
          </div>
          <div className="row">
            <div className="col">
              <a
                href={`${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`}
              >
                <FontAwesomeIcon icon={faArrowLeft} className="text-dark mr-2" /> Go back
              </a>
            </div>
          </div>
        </>
      ) : (
        <>
          {resolvedResources.map((rr, index) => <ResourceItem key={`rr-${index}`} data={rr} />)}
          <span className="text-muted">Found {resolvedResources.length} {resolvedResources.length === 1 ? 'entry' : 'entries'}.</span>
        </>
      )
    );
  }
}


// Redux mappings
const mapStateToProps = (state) => ({
  resolvedResources: state.resolvedResources
});


export default withRouter(connect (mapStateToProps)(ResourceList));
