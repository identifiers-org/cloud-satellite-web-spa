import React from 'react';
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux';

// Actions.
import { getConfigFromDevopsApi } from './actions/Config';
import { getSchemaOrgMetadataFromRegistry, getSchemaOrgMetadataByPrefixFromRegistry } from './actions/SchemaOrgMetadata';

// Components.
import AppRouter from './routers/AppRouter';
import store from './store/store';

// Utils.
import { querySplit } from './utils/identifiers';

import { MatomoProvider, createInstance } from '@datapunt/matomo-tracker-react';

//import '../node_modules/EBI-Icon-fonts/fonts.css';
//import '../node_modules/ebi-framework/css/ebi-lite.css';
//import '../node_modules/ebi-framework/js/script.js';

//import './styles/styles.scss';

// ==================== APP Initialization ====================
(async () => {
  const instance = createInstance({
    urlBase: 'https://matomo.identifiers.org/',
    siteId: 1,
    disabled: false, // optional, false by default. Makes all tracking calls no-ops if set to true.
    heartBeat: { // optional, enabled by default
      active: true, // optional, default value: true
      seconds: 30 // optional, default value: `15
    },
    linkTracking: true, // optional, default value: true
    configurations: { // optional, default value: {}
      // any valid matomo configuration, all below are optional
      disableCookies: true,
      setSecureCookie: location.protocol.includes('https'), // Only available in https
      setRequestMethod: 'GET'
    }
  })

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
  const rootElement = document.getElementById("app");
  const reactRoot = createRoot(rootElement)
  reactRoot.render(
    <Provider store={store}>
      <MatomoProvider value={instance}>
        <AppRouter />
      </MatomoProvider>
    </Provider>
  );

//  // Run ebi framework stuff.
//  ebiFrameworkPopulateBlackBar();
//  ebiFrameworkActivateBlackBar();
//  ebiFrameworkExternalLinks();
//  ebiFrameworkManageGlobalSearch();
//  ebiFrameworkSearchNullError();
//  ebiFrameworkHideGlobalNav();
//  ebiFrameworkAssignImageByMetaTags();
//  ebiFrameworkInsertEMBLdropdown();
//  ebiFrameworkUpdateFoot();
//  ebiFrameworkUpdateFooterMeta();
//  ebiFrameworkIncludeAnnouncements();
//  ebiFrameworkRunDataProtectionBanner('1.3');
  ebiFrameworkInvokeScripts();
})()
