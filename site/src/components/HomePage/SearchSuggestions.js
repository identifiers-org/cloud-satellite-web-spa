import React from 'react';

import SearchHelper from './SearchHelper';
import { isSmallScreen } from '../../utils/responsive';
import { config } from '../../config/Config'

import PropTypes from 'prop-types';
import { querySplit } from "../../utils/identifiers";

class SearchSuggestions extends React.Component {
  constructor(props) {
    super(props);

    props.suggestionListRef.current = this;

    this.state = {
      namespaceList: [],
      selectedNamespace: -1,
      loading: false,
    };

    this.updateDebounceRef = React.createRef();

    this.updateDebounceRef.current = setTimeout(
      () => this.setState({
        loading: true
      }, this.updateNamespaces),
      600);
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.query !== this.props.query) {
      clearTimeout(this.updateDebounceRef.current)
      this.updateDebounceRef.current = setTimeout(() => this.setState({loading: true}, this.updateNamespaces), 600);
    }
  }

  componentWillUnmount = ()=> {
    clearTimeout(this.updateDebounceRef.current)
    this.props.suggestionListRef.current = null;
  }

  updateNamespaces = async () => {
    const { query } = this.props;
    if (!query) {
      this.setState({loading: false})
    } else {
      const { prefix } = querySplit(query);
      const namespaces = (await this.queryEbiSearchForRelevantNamespaces())?.slice(0, config.suggestionQuerySize) || [];
      this.setState({
        namespaceList: namespaces,
        selectedNamespace: namespaces.findIndex(ns => ns.prefix === prefix)
      }, () => this.setState({loading: false}));
    }
  }

  queryEbiSearchForRelevantNamespaces = async () => {
    const { query } = this.props;
    const { ebiSearchDomainEndpoint, ebiSearchResponseSize } = config;
    const preprocessedQuery = this.preprocessQueryString(query)
    const params = new URLSearchParams({
      fields: 'name,prefix,lui_pattern,sample_id',
      size: ebiSearchResponseSize.toString(),
      query: preprocessedQuery,
      format: 'JSON',
      entryattrs: 'score',
    });
    return await fetch(ebiSearchDomainEndpoint + '?' + params)
      .then(r => r.json())
      .then(json => json.entries?.map(e => {
        return { score: e.score, ...e.fields }
      }) || [])
      .then(namespaces => namespaces.map(namespace => {
        const newEntries = Object.entries(namespace)
          .map(([attr, val]) =>
            [attr, Array.isArray(val) ? val[0] : val])
        return Object.fromEntries(newEntries);
      }))
      .then(namespaces => {
        this.updateScoreInPlaceByMatchingLuis(namespaces);
        return namespaces;
      });
  }

  hasSelection = () => { // This is used by the parent component
    return this.state.selectedNamespace !== -1;
  }

  clickSelection = async () => { // This is used by the parent component
    const { selectedNamespace, namespaceList } = this.state;
    if (selectedNamespace === -1) return;

    const prefix = namespaceList[selectedNamespace].prefix;
    document.getElementById(`suggestion-${prefix}`)?.click();
  }

  upSelection = async (n = 1) => { // This is used by the parent component
    const { selectedNamespace, namespaceList } = this.state;
    if (selectedNamespace === 0 || namespaceList.length === 0) return;

    let newPosition = -1;
    if (selectedNamespace === -1) {
      if (namespaceList.length !== 0) newPosition = 0;
    } else {
      newPosition = Math.max(0, selectedNamespace-n);
    }

    this.setState(
      { selectedNamespace: newPosition },
      () => {
        document.getElementById('suggestion-' + namespaceList[newPosition].prefix)
          ?.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'center'})
      }
    )
  }

  downSelection = async (n = 1) => { // This is used by the parent component
    const { selectedNamespace, namespaceList } = this.state;
    if (selectedNamespace === namespaceList.length-1 || namespaceList.length === 0) return;

    let newPosition = -1;
    if (selectedNamespace === -1) {
      if (namespaceList.length !== 0) newPosition = 0;
    } else {
      newPosition = Math.min(namespaceList.length-1, selectedNamespace+n)
    }
    this.setState(
      { selectedNamespace: newPosition },
      () => {
        document.getElementById('suggestion-' + namespaceList[newPosition].prefix)
          ?.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'center'})
      }
    )
  }

  setSelectedNamespace = async (idx) => {
    this.setState({ selectedNamespace: idx })
  }

  handleSuggestionClick = async (namespace) => {
    const { query } = this.props;
    const splitQuery = query.replace('"', ' ').replace(':', ' ').split(/\s+/);

    const possibleId = this.getPossibleLocalIdFromQuery(splitQuery, namespace.lui_pattern) || '';
    this.props.setSuggestion(`${namespace.prefix}:${possibleId}`);
  }

  /**
   * Replaces colors to whitespace to prevent EBI search errors.
   * Then, splits the query by whitespace without splitting double-quoted sections,
   * then joins the sections with OR. This has better results when a query
   * includes a local ID.
   * @param query raw string query issued by user
   * @returns {string}
   */
  preprocessQueryString = (query) => {
    query = query.replace(':', ' ');
    const quoteSplitQuery = query.split('"');
    let elements;
    if (quoteSplitQuery.length < 3) {
      elements = query.split(/\s+/)
    } else {
      elements = []
      for (let idx in quoteSplitQuery) {
        let val = quoteSplitQuery[idx];
        if (idx % 2 === 1) {
          // quoted parts
          elements.push('"' + val + '"')
        } else {
          // unquoted parts
          elements.push(...val.split(/\s+/))
        }
      }
    }
    return elements.map(s => s?.trim()).filter(Boolean).join(" OR ");
  }

  updateScoreInPlaceByMatchingLuis = (namespaces) => {
    const { query } = this.props;
    if (!query || !config.ebiSearchRescoreWhenSingleIdDetected) return;

    const splitQuery = query.replace('"', ' ').replace(':', ' ').split(/\s+/);
    const maxScore = Math.max(...namespaces.map(n => n.score))
    namespaces?.forEach(namespace => {
      const possibleId = this.getPossibleLocalIdFromQuery(splitQuery, namespace.lui_pattern);
      if (possibleId) {
        // Increase score if one of the query elements may be an ID
        namespace.score += maxScore;
      }
    });
    namespaces.sort((n1, n2) => n2.score - n1.score)
  }

  handleSuggestionLinkClick = (prefix) => {
    window.open(`${config.registryUrl}/registry/${prefix}`, '_blank');
  }

  getPossibleLocalIdFromQuery = (splitQuery, lui_pattern) => {
    if (splitQuery.length < 2) return null;

    const luiPattern = new RegExp(lui_pattern)
    const matches = splitQuery
      .filter(queryToken => luiPattern.test(queryToken))
    if (matches.length === 1) {
      return matches.pop()
    } else {
      return null;
    }
  }

  render = () => {
    const {
      props: {
        query,
        setSearchState,
        closeSuggestions
      },
      state: { namespaceList, selectedNamespace, loading }
    } = this;

    // Resource name conditional tag.
    const ResourceNameTag = isSmallScreen() ? 'small' : 'p';

    return (
      <div className="inline-search-container">
        <button type='button' onClick={closeSuggestions} className='closeBttn' title='Close suggestion box'>
          <i className="icon icon-common icon-close"></i>
        </button>
        <div className="hints-box">
          <SearchHelper setSearchState={setSearchState} query={query}
                      namespaceList={namespaceList} loading={loading}/>
        </div>
        {
          // Render search suggestion list if it contains elements.
          namespaceList.length > 0 && (
            <div className="suggestions-box">
              <div className="row mx-1">
                <div className="col align-self-end">
                  <p className="text-muted text-right my-0"><small>Suggestions</small></p>
                </div>
              </div>

              <ul className="suggestion-list pb-2">
                {
                  loading && <li> Loading... </li>
                }
                {
                  !loading && namespaceList.map((namespace, index) => (
                    <li
                      key={'li-suggestion-' + namespace.prefix}
                      className={`suggestion ${selectedNamespace === index ? 'suggestion__selected' : ''}`}
                    >
                      <div className="row g-0 py-1 mx-2">
                        <div className="col col-11">
                          <button
                            type='button'
                            className="clear-link d-flex align-items-center"
                            id={'suggestion-' + namespace.prefix}
                            onClick={() => this.handleSuggestionClick(namespace)}
                            onMouseOver={() => {
                              this.setSelectedNamespace(index)
                            }}
                            onFocus={() => {
                              this.setSelectedNamespace(index)
                            }}
                          >
                            <span
                              className={`badge ${selectedNamespace === index ? 'badge-secondary border border-dark' : 'badge-dark border border-secondary'} font-weight-normal`}>
                                {namespace.prefix}
                            </span>

                            <ResourceNameTag
                              className={`mb-0 ml-2 ${selectedNamespace === index ? 'text-white' : ''} text-ellipsis`}
                            >
                              {namespace.name}
                              <span
                                className={`${selectedNamespace === index ? 'text-white bg-gray' : 'text-muted bg-white'} small ml-1 ml-sm-2`}>
                                <span className='d-none d-sm-inline'>sample:</span> {namespace.sample_id}
                              </span>
                            </ResourceNameTag>
                          </button>
                        </div>
                        <div className="col col-1">
                          <button
                            className={`ml-auto ${selectedNamespace === index ? 'text-white' : ''}`}
                            onClick={() => {
                              this.handleSuggestionLinkClick(namespace.prefix)
                            }}
                            title='See namespace page'
                            type="button"
                          >
                            <i className="icon icon-common icon-external-link-alt ml-1"/>
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

SearchSuggestions.propTypes = {
  query: PropTypes.string.isRequired,
  suggestionListRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
  setSuggestion: PropTypes.func.isRequired,
  setSearchState: PropTypes.func.isRequired,
  closeSuggestions: PropTypes.func.isRequired,
}
export default SearchSuggestions;
