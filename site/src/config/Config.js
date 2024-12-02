export const config = {
  // Url used for resolving a resource to get its providers. Used when clicking 'resolve' in the home page.
  resolverApi: 'https://resolver.api.identifiers.org',

  // Hardcoded Url used to build the links shown in the resolver page.
  resolverHardcodedUrl: 'http://identifiers.org',

  // Registry API Url used to fetch namespaces for the suggestions box.
  registryApi: 'https://registry.api.identifiers.org',

  // This requires a working HQ architecture with a central registry.
  showSearchSuggestions: true,
  suggestionListSize: 10,
  suggestionQuerySize: 25,

  // Show beta banner:
  showBetaBanner: false,

  // We don't predict resources in suggestions box for now.
  enableResourcePrediction: false,

  // HQ Registry Url used in navbar and in link buttons in suggestions.
  registryUrl: 'https://registry.identifiers.org',

  // Documentation Url.
  documentationUrl: '//docs.identifiers.org',

  // HQ Prefix registration request used in navbar.
  registryPrefixRegistrationRequestFormUrl: 'https://registry.identifiers.org/prefixregistrationrequest',

  // Feedback Url. Links to github 'new issue' in our github pages repository.
  feedbackUrl: '//github.com/identifiers-org/identifiers-org.github.io/issues/new',

  // Old platform Url. Used in navbar.
  oldIdentifiersUrl: 'https://ebi.identifiers.org',

  apiVersion: '1.0',

  // Schema.org metadata endpoints.
  schemaOrgPlatformEndpoint: 'schemaOrgApi/getMetadataForPlatform',
  schemaOrgNamespaceEndpoint: 'schemaOrgApi/getMetadataForNamespace',
  schemaOrgNamespacePrefixEndpoint: 'schemaOrgApi/getMetadataForNamespacePrefix',

  ebisearchDomainEndpoint:
};
