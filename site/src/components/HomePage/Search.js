import React from 'react';
import { useNavigate } from 'react-router-dom';
import SearchStates from './SearchStates'
import SearchSuggestions from './SearchSuggestions';
import { config } from '../../config/Config';
import { isSmallScreen } from '../../utils/responsive';
import PropTypes from 'prop-types';


class Search extends React.Component {
  exampleCuries = Object.freeze([ 'uniprot:P12345', 'pdb:2gc4', 'taxonomy:9606' ])

  constructor(props) {
    super(props);

    this.state = {
      isSearchValid: false,
      showSuggestions: false,
      query: '',
    }

    this.search = React.createRef();
    this.suggestionListRef = React.createRef();
  }

  setSearchState = (currentState) => {
    const isNewStateValid = currentState === SearchStates.VALID_CURIE;
    if (this.state.isSearchValid !== isNewStateValid) {
      this.setState({isSearchValid : isNewStateValid})
    }
  }

  handleFocusShowSuggestions = () => {
    this.setState({
      showSuggestions: true
    })
    // Also scroll down to take the suggestion bar to the top of screen in small screens.
    if (isSmallScreen()) {
      const searchBarYOffset = this.search.current.getBoundingClientRect().top + window.pageYOffset - 130;
      window.scroll({top: searchBarYOffset, behavior: 'smooth'});
    }
  };

  closeSuggestions = () => {
    this.setState({
      showSuggestions: false
    })
  }

  handleChange = () => {
    this.setState({
      query: this.search.current.value,
    });
  }

  handleKeyDown = e => {
    switch (e.key) {
      case 'Enter': {
        e.preventDefault();
        if (this.suggestionListRef.current?.hasSelection()) {
          this.suggestionListRef.current?.clickSelection();
        }
        else if (this.state.isSearchValid) {
          this.props.onButtonClick(this.state.query);
        }
        break;
      }

      case 'ArrowUp': {
        e.preventDefault();
        this.suggestionListRef.current?.upSelection()
        break;
      }

      case 'ArrowDown': {
        e.preventDefault();
        this.suggestionListRef.current?.downSelection();
        break;
      }

      case 'PageDown': {
        e.preventDefault();
        this.suggestionListRef.current?.downSelection(5);
        break;
      }

      case 'PageUp': {
        e.preventDefault();
        this.suggestionListRef.current?.upSelection(5);
        break;
      }
    }
  }

  handleSuggestion = (suggestion) => {
    this.setState({
      query: suggestion,
      showSuggestions: true,
    }, () => this.search.current.focus());
  }

  handleSubmit = e => {
    e.preventDefault();
    this.handleButtonClick();
  }

  handleButtonClick = () => {
    if (this.state.isSearchValid) {
      this.props.onButtonClick(this.state.query);
    }
  }

  handleExampleClick = (e) => {
    e.preventDefault();
    if (e.key && e.key !== 'Enter') return; // Check for Enter key keyboard event (For accessibility)
    this.search.current.value = e.target.innerText;
    this.handleChange();
    this.search.current.focus();
  }

  render() {
    const {
      props: { buttonCaption, placeholderCaption },
      state: { query, showSuggestions, isSearchValid }
    } = this;

    return (
      <form onSubmit={this.handleSubmit} role='search'>
        <div className="form-group">
          <small className="form-text text-muted ml-1">
            Examples:{' '}
            {
              this.exampleCuries.map(example => (
                  <a role='suggestion' key={example} tabIndex='0'
                     onClick={this.handleExampleClick}
                     onKeyDown={this.handleExampleClick}
                     className='text-primary text-decoration-none mr-2'>
                    {example}
                  </a>
              ))
            }
          </small>
          <div className="input-group">
            <input
                role="searchbox"
                spellCheck={false}
                className="form-control search-input"
                onChange={this.handleChange}
                onKeyDown={this.handleKeyDown}
                onFocus={this.handleFocusShowSuggestions}
                placeholder={placeholderCaption}
                ref={this.search}
                value={query}
            />
            <div className="input-group-append">
              <button
                  className="btn btn-primary search-button"
                  onFocus={this.handleFocusShowSuggestions}
                  onClick={this.handleButtonClick}
                  disabled={!isSearchValid}
              >
                {buttonCaption}
              </button>
            </div>
            {config.showSearchSuggestions && showSuggestions &&
                <SearchSuggestions
                    setSearchState={this.setSearchState}
                    closeSuggestions={this.closeSuggestions}
                    setSuggestion={this.handleSuggestion}
                    suggestionListRef={this.suggestionListRef}
                    query={query}
                />
            }
          </div>
          <a className="text-muted text-sm ml-1" href="https://www.ebi.ac.uk/ebisearch">
            powered by EBI Search
          </a>
        </div>
      </form>
    )
  }
}

Search.propTypes = {
  onButtonClick: PropTypes.func.isRequired,
  buttonCaption: PropTypes.string.isRequired,
  placeholderCaption: PropTypes.string.isRequired
}
export default props => {
  const navigate = useNavigate();
  return <Search {...props} navigate={navigate} />
};