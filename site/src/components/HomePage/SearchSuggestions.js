import React from 'react';
import { connect } from 'react-redux';

import SearchEvaluator from './SearchEvaluator';
import { isSmallScreen } from '../../utils/responsive';


class SearchSuggestions extends React.Component {
  constructor(props) {
    super(props);
  }


  highlightQuery = (prefix, query) => {
    const parts = prefix.split(query);
    let result;
    let complete = false;

    if (prefix === query) {
      result = <strong>{query}</strong>;
      complete = true;
    } else {
      result = parts.reduce(
        (sum, part, index) =>
          [...sum, part, <strong key={`${prefix}-${index}`} className="text-warning">{query}</strong>], []).slice(0, -1);
    }

    return <span
      className={`badge ${complete ? 'badge-secondary border border-dark' : 'badge-dark border border-secondary'} font-weight-normal`}
    >
      {result}
    </span>
  }

  handleSuggestionLinkClick = (prefix) => window.open(`${this.props.config.registryUrl}/registry/${prefix}`, '_blank');


  render() {
    const {
      handleSuggestionLinkClick,
      highlightQuery,
      props: {
        handleClick,
        mouseOver,
        queryParts,
        searchSuggestionList,
        selectedSearchSuggestion,
        setSuggestionListRef
      }
    } = this;

    // No suggestion list & no query: don't render anything!
    if (searchSuggestionList.length === 0 && queryParts.resource === '' && queryParts.prefix === '' && queryParts.id === '') {
      return '';
    }

    // Resource name conditional tag.
    const ResourceNameTag = isSmallScreen() ? 'small' : 'p';

    return (
      <div className="inline-search-container">
        {
          (queryParts.prefix || queryParts.id || queryParts.resource) && (
            <div className="hints-box">
              <div className="row mx-1">
                <div className="col align-self-end">
                  <p className="text-muted text-right my-0"><small>Your query</small></p>
                </div>
              </div>
              <SearchEvaluator queryParts={queryParts} />
            </div>
          )
        }

        {
          // Render search suggestion list if it contains elements.
          searchSuggestionList.length > 0 && (
            <div className="suggestions-box">
              <div className="row mx-1">
                <div className="col align-self-end">
                  <p className="text-muted text-right my-0"><small>Suggestions</small></p>
                </div>
              </div>

              <ul className="suggestion-list pb-2" ref={ref => setSuggestionListRef(ref)}>
                {
                  searchSuggestionList.map((result, index) => (
                    <li
                      key={`suggestion-${index}`}
                      onMouseOver={() => {mouseOver(index)}}
                      className={`suggestion ${selectedSearchSuggestion === index ? 'suggestion__selected' : ''}`}
                    >
                      <div className="row g-0 py-1 mx-2">
                        <div className="col col-11">
                         <a
                            className="clear-link d-flex align-items-center"
                            href="#!"
                            id={result.prefix}
                            key={result.prefix}
                            onClick={() => {handleClick(result)}}
                          >
                            {highlightQuery(result.namespaceEmbeddedInLui ? result.pattern.slice(1).split(':')[0].replace(/[\(\/\\\)]/gm, '') : result.prefix, queryParts.prefix)}

                            <ResourceNameTag
                              className={`mb-0 ml-2 ${selectedSearchSuggestion === index ? 'text-white' : ''} text-ellipsis`}
                            >
                              {result.name}
                              <span className={`${selectedSearchSuggestion === index ? 'text-white' : 'text-muted'} small ml-1 ml-sm-2`}>
                                <span className='d-none d-sm-inline'>Sample ID:</span> {result.sampleId}
                              </span>
                            </ResourceNameTag>
                          </a>
                        </div>
                        <div className="col col-1">
                          <button
                            className={`ml-auto clear-button ${selectedSearchSuggestion === index ? 'text-white' : ''}`}
                            onClick={() => {handleSuggestionLinkClick(result.prefix)}}
                            type="button"
                          >
                            <i className="icon icon-common icon-external-link-alt" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))
                }
              </ul>
            </div>
          )
        }
      </div>
    );
  }
}

// Redux mappings.
const mapStateToProps = (state) => ({
  config: state.config
});

export default connect(mapStateToProps)(SearchSuggestions);
