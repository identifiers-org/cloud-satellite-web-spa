export default Object.freeze({
  NO_CURIE: Symbol('Query doesnt look like a curie'),
  QUERYING_NAMESPACES: Symbol('Query is for searching thru namespaces'),
  PREFIX_ONLY: Symbol('Only prefix seem to be present'),
  PREFIX_WITH_COLON: Symbol('Only prefix with a colon is present'),
  VALID_CURIE: Symbol('The query seems to be a valid curie'),
  INVALID_LOCAL_ID: Symbol('The query seems to be a curie with invalid ID'),
  INVALID_PREFIX: Symbol('The query seems to be a curie with invalid prefix')
})