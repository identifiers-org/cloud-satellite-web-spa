import React from 'react';
import { connect } from 'react-redux';
import { swalToast } from '../../utils/swalDialogs';

import { evaluateSearch } from '../../utils/identifiers';


class SearchEvaluator extends React.Component {
  constructor(props) {
    super(props);
  }
  copyToClipboard = (text, ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    navigator.clipboard.writeText(text).then(
      () => {
        swalToast.fire({
          icon: 'success',
          title: 'Copied to clipboard'
        })
      },
      (err) => {
        swalToast.fire({
          icon: 'error',
          title: `Failed to copy to clipboard: ${err}`
        })
      }
    );
  }

  render() {
    const { config, namespaceList, queryParts } = this.props;

    const evaluation = evaluateSearch(queryParts, namespaceList, config.enableResourcePrediction);

    const idorgURI = queryParts.id && queryParts.prefix && evaluation === 'ok' ?
      `${config.resolverHardcodedUrl}/${queryParts.prefix}:${queryParts.id}` : null

    return (
      <>
        <div className="row g-0 ml-3 mr-2">
          <div className="col d-flex align-items-center">
            {(() => {
              switch (evaluation) {
                case 'ok':
                  return <i className="icon icon-common icon-check-circle size-200 text-success mr-2" />
                case 'prefix_empty': case 'id_empty':
                  return <i className="icon icon-common icon-exclamation-triangle size-200 text-warning mr-2" />
                case 'prefix_unknown': case 'id_bad':
                  return <i className="icon icon-common icon-times-circle size-200 text-danger mr-2" />
              }
            })()}
            {(() => {
              switch (evaluation) {
                case 'ok':
                  return (
                    <small className="text-block mr-0">
                      Your compact identifier appears to be valid.
                    </small>
                  );
                case 'prefix_empty':
                  return (
                    <small className="text-block mr-0">
                      Your compact identifier appears to be incomplete: The prefix is missing.
                    </small>
                  );
                case 'prefix_unknown':
                  return (
                    <small className="text-block mr-0">
                      Your compact identifier appears to be incorrect: The prefix&nbsp;
                      <span className="font-weight-bold">{queryParts.prefixEffectiveValue}</span>&nbsp;
                      does not exist in the registry.
                    </small>
                  );
                case 'id_empty':
                  return (
                    <small className="text-block mr-0">
                      Your compact identifier appears to be incomplete, the local id is missing.
                    </small>
                  );

                case 'id_bad': {
                  const currentNamespace = namespaceList.filter(namespace => namespace.prefix === queryParts.prefixEffectiveValue)[0];
                  return (
                    <small className="text-block mr-0">
                      Your compact identifier appears to be incorrect: The local id&nbsp;
                      <span className="font-weight-bold">{queryParts.id}</span>&nbsp;
                      does not match the pattern&nbsp;
                      <span className="text-monospace">{currentNamespace? currentNamespace.pattern : ''}</span>.
                    </small>
                  );
                }

                case 'resource_not_empty': {
                  return (
                    <small className="text-block mr-0">
                      Your compact identifier appears to be incorrect: You have specified a provider code (
                      <span className="font-weight-bold">{queryParts.resource}</span>
                      ). That is not a compact identifier. Please, remove the provider code.
                    </small>
                  );
                }

                case 'resource_bad': {
                  return (
                    <small className="text-block mr-0">
                      Your compact identifier appears to be incorrect: The provider code&nbsp;
                      <span className="font-weight-bold">{queryParts.resource}</span>&nbsp;
                      does not exist for the prefix&nbsp;
                      <span className="font-weight-bold">{queryParts.prefixEffectiveValue}</span>.
                    </small>
                  );
                }
              }
            })()}
            {evaluation.message}
          </div>
        </div>

        <div className="row g-0 ml-3 mr-2">
          <div className="col ml-5">
            <div className="table-responsive">
              <table className="table table-borderless">
                <tbody>
                  {queryParts.resource ?
                    (
                      <tr>
                        <td className="w-25 p-0 font-weight-light font-italic text-muted"><small>Resource:</small></td>
                        <td className="p-0 text-block"><small>{queryParts.resource || 'default'}</small></td>
                      </tr>
                    ) : null
                  }
                  <tr>
                    <td className="w-25 p-0 font-weight-light font-italic text-muted"><small>Prefix:</small></td>
                    <td className="p-0 text-block"><small>{queryParts.prefix || 'empty'}</small></td>
                  </tr>
                  <tr>
                    <td className="w-25 p-0 font-weight-light font-italic text-muted"><small>Local id:</small></td>
                    <td className="p-0 text-block"><small>{queryParts.id || 'empty'}</small></td>
                  </tr>
                  { idorgURI &&
                    <tr>
                      <td className="w-25 p-0 font-weight-light font-italic text-muted"><small>URI:</small></td>
                      <td className="p-0 text-block">
                        <small><a href={idorgURI}>{idorgURI}</a></small>
                        <a className='text-muted ml-1' title='copy to clipboard'
                          onClick={(ev) => this.copyToClipboard(idorgURI, ev)}>
                          <i className="icon icon-common icon-copy"></i>
                        </a>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </>
    );
  }
}


const mapStateToProps = (state) => ({
  namespaceList: state.namespaceList,
  config: state.config
});

export default connect (mapStateToProps)(SearchEvaluator);
