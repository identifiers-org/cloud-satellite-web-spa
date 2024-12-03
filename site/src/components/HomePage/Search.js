import React from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Components.
import SearchSuggestions from './SearchSuggestions';

// Config.
import { config } from '../../config/Config';

// Actions.
import { getNamespacesFromRegistry } from '../../actions/NamespaceList';
import { setConfig } from '../../actions/Config';

// Utils.
import { querySplit, completeQuery, evaluateSearch } from '../../utils/identifiers';
import { isSmallScreen } from '../../utils/responsive';


class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      query: '',
      queryParts: {
        resource: undefined,
        prefix: undefined,
        prefixEffectiveValue: undefined,
        id: undefined,
        idWithEmbeddedPrefix: undefined,
        bad: []
      },
      activeSuggestion: -1,
      namespaceList: []
    }

    this.search = React.createRef();
    this.suggestionListRef = React.createRef();
  }

  componentDidMount() {
    this.updateNamespaceList();
  }


  updateNamespaceList = async () => {
    const {
      props: {
        getNamespacesFromRegistry,
        config: { suggestionListSize }
      },
      state: { queryParts: { prefixEffectiveValue } }
    } = this;

    // set active suggestion to -1.
    this.setState({activeSuggestion: -1});

    await getNamespacesFromRegistry(prefixEffectiveValue);

    const namespaceList = this.props.namespaceList.sort((a, b) => {
      if (a.prefix.startsWith(prefixEffectiveValue) && !b.prefix.startsWith(prefixEffectiveValue)) {
        return -1;
      }

      if (!a.prefix.startsWith(prefixEffectiveValue) && b.prefix.startsWith(prefixEffectiveValue)) {
        return 1;
      }

      return a.prefix - b.prefix;
    }).slice(0, suggestionListSize)
    namespaceList.sort((n1, n2) => n1.prefix.length - n2.prefix.length);
    this.setState({ namespaceList });
  }

  handleFocusShowSuggestions = () => {
    const {
      search,
      props: { setConfig }
    } = this;

    setConfig({showSearchSuggestions: true})

    // Also scroll down to take the suggestion bar to the top of screen in small screens.
    if (isSmallScreen()) {
      const searchBarYOffset = search.getBoundingClientRect().top + window.pageYOffset - 130;
      window.scroll({top: searchBarYOffset, behavior: 'smooth'});
    }
  };

  // Ref to handle suggestion list scroll when using arrows keys.
  setSuggestionListRef = (ref) => {
    if (ref) {
      this.suggestionListRef = ref;
    };
  }

  handleChange = () => {
    const { updateNamespaceList } = this;

    this.setState({
      query: this.search.current.value,
      queryParts: querySplit(this.search.current.value)
    }, () => {
      updateNamespaceList();
    });
  }

  handleKeyDown = e => {
    const {
      handleChange,
      handleSearch,
      state: { namespaceList, activeSuggestion, queryParts },
      suggestionListRef
    } = this;

    switch (e.keyCode) {
    case 13: {  // Enter key
      e.preventDefault();   // Do not send form.

      if (activeSuggestion === -1) {
        handleSearch();
      } else {
        e.currentTarget.value = completeQuery(queryParts.resource, namespaceList[activeSuggestion], queryParts.id);
        handleChange();
        break;
      }
      break;
    }

    case 38: {  // Up key
      e.preventDefault();   // Do not take cursor to start of input text.

      if (this.state.activeSuggestion > -1) {
        this.setState({activeSuggestion: activeSuggestion - 1});
        // Scroll up to that item.
        if ((activeSuggestion - 1) * 33 < suggestionListRef.scrollTop) {
          suggestionListRef.scrollTop -= 33;
        }
      }
      break;
    }

    case 40: {  // Down key
      e.preventDefault();   // Do not take cursor to end of input text.

      if (activeSuggestion < namespaceList.length - 1) {
        this.setState({activeSuggestion: activeSuggestion + 1});
        // Scroll down to that item.
        if ((activeSuggestion + 2) * 33 > suggestionListRef.clientHeight) {
          suggestionListRef.scrollTop += 33;
        }
      }
      break;
    }
    }
  }

  handleMouseOver = index => {
    this.setState({activeSuggestion: index});
  }

  handleClick = (query) => {
    const { queryParts } = this.state;

    this.setState({query: completeQuery(queryParts.resource, query, queryParts.id)}, () => {this.handleChange()});
  }

  handleSubmit = e => {
    e.preventDefault();
    this.handleSearch();
  }

  handleSearch = () => {
    const {
      // props: { history },
      state: { query }
    } = this;
    if (this.handleEvaluateSearch()) {
      this.props.navigate(`resolve?query=${query}`);
    }
  }

  handleEvaluateSearch = () => {
    const {
      props: { config },
      state: { namespaceList, queryParts }
    } = this;

    const evaluation = evaluateSearch(queryParts, namespaceList, config.enableResourcePrediction);

    return evaluation === 'ok';
  }

  handleClickGoToButton = e => {
    const { queryParts } = this.state;

    e.preventDefault();

    window.location.href = `${config.resolverHardcodedUrl}/${queryParts.prefix}:${queryParts.id}`;
  }

  handleExampleClick = (e) => {
    e.preventDefault();
    this.search.current.value = e.target.innerText;
    this.handleChange();
  }

  render() {
    const {
      handleChange,
      handleClick,
      handleClickGoToButton,
      handleEvaluateSearch,
      handleFocusShowSuggestions,
      handleKeyDown,
      handleMouseOver,
      handleSubmit,
      setSuggestionListRef,
      props: { button = false, buttonCaption, config, floatingGoToButton, placeholderCaption },
      state: { activeSuggestion, namespaceList, query, queryParts }
    } = this;

    return (
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <small className="form-text text-muted ml-1">
            Examples:
              <a onClick={this.handleExampleClick} className='ml-1'>
                uniprot:P12345
              </a>,
              <a onClick={this.handleExampleClick} className='ml-1'>
                pdb:2gc4
              </a>
          </small>
          <div className="input-group">
            <input
              autoFocus={!isSmallScreen()}
              spellCheck={false}
              className="form-control search-input"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocusShowSuggestions}
              placeholder={placeholderCaption}
              ref={this.search}
              value={query}
            />
            <div className="input-group-append">
              {floatingGoToButton && handleEvaluateSearch() && (
                <button
                  className="button-floating"
                  onClick={handleClickGoToButton}
                  tabIndex={-1}
                >
                  <i className="icon icon-common icon-external-link-square-alt size-150" />
                </button>
              )}
              {button && (
                <button
                  className="btn btn-primary search-button"
                  onFocus={handleFocusShowSuggestions}
                >
                  {buttonCaption}
                </button>
              )}
            </div>
            { config.showSearchSuggestions &&
              <SearchSuggestions
                searchSuggestionList={namespaceList}
                selectedSearchSuggestion={activeSuggestion}
                setSuggestionListRef={setSuggestionListRef}
                queryParts={queryParts}
                mouseOver={handleMouseOver}
                handleClick={handleClick}
              />
            }
          </div>
        </div>
      </form>
    )
  }
}


const mapStateToProps = (state) => ({
  config: state.config,
  namespaceList: state.namespaceList
});

const mapDispatchToProps = dispatch => ({
  getNamespacesFromRegistry: (query) => dispatch(getNamespacesFromRegistry(query)),
  setConfig: (config) => dispatch(setConfig(config))
});

export default connect(mapStateToProps, mapDispatchToProps)(props => {
  const navigate = useNavigate();
  return <Search {...props} navigate={navigate} />
});