import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

// Actions.
import { getConfigFromDevopsApi } from './actions/Config';
import { getSchemaOrgMetadataFromRegistry, getSchemaOrgMetadataByPrefixFromRegistry } from './actions/SchemaOrgMetadata';

// Components.
import AppRouter from './routers/AppRouter';
import store from './store/store';

// Utils.
import { querySplit } from './utils/identifiers';

import './styles/styles.scss';


// App container.
const jsx = (
  <Provider store={store}>
    <AppRouter />
  </Provider>
);


// ==================== APP Initialization ====================
(async () => {
  // Get initial data.
  // Configuration from devops endpoint, which will be residing in the same url as the app.
  const configUrlPort = process.env.NODE_ENV === 'development' ? 9090 : window.location.port;
  const configUrl = `${window.location.protocol}//${window.location.hostname}:${configUrlPort}`;

  await store.dispatch(getConfigFromDevopsApi(configUrl));

  // Get Schema.org Metadata depending on current path and append it to the document's head.
  /* Do not use URLSearchParams so google structured search tool can use this. ( <= chrome 42)
  const searchParams = new URLSearchParams(window.location.search);
  const query = searchParams.get('query');
  */
  const query = window.location.search.split('query=').pop();

  if (query) {
    const splitQuery = querySplit(query);
    await store.dispatch(getSchemaOrgMetadataByPrefixFromRegistry(splitQuery.prefix));
  } else {
    await store.dispatch(getSchemaOrgMetadataFromRegistry());
  }



  // Render app.
  ReactDOM.render(jsx, document.getElementById("app"));

  // Run ebi framework stuff.
  ebiFrameworkPopulateBlackBar();
  ebiFrameworkActivateBlackBar();
  ebiFrameworkExternalLinks();
  ebiFrameworkManageGlobalSearch();
  ebiFrameworkSearchNullError();
  ebiFrameworkHideGlobalNav();
  ebiFrameworkAssignImageByMetaTags();
  ebiFrameworkInsertEMBLdropdown();
  ebiFrameworkUpdateFoot();
  ebiFrameworkUpdateFooterMeta();
  ebiFrameworkIncludeAnnouncements();
  ebiFrameworkRunDataProtectionBanner('1.3');
})()
