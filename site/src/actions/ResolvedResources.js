//
// ResolvedResources actions.
//

// Resolve a compact identifier. Will dispatch setResolvedResources.
export const getResolvedResources = (query) => {
  return async (dispatch, getState) => {
    const config = getState().config;
    let requestUrl = new URL(`${config.resolverApi}/${query}`);

    let response;
    let data;

    try {
      response = await fetch(requestUrl);
      if (response.ok) {
        data = await response.json();
      } else {
        data = []
      }
    }
    catch (err) {
      console.error('Error fetching namespaces: ', err);
    }

    // Sort resources by their score.
    if (data && data.hasOwnProperty('payload')) {
      data = data.payload.resolvedResources.sort((a, b) => b.recommendation.recommendationIndex - a.recommendation.recommendationIndex);

      // Add compact identifier to every resource.
      data.forEach(resolvedResource => {
        if (resolvedResource.hasOwnProperty("providerCode") && resolvedResource.providerCode !== 'CURATOR_REVIEW') {
          resolvedResource['compactIdentifier'] = `${config.resolverApi}/${resolvedResource.providerCode}/${query}`
        } else {
          resolvedResource['compactIdentifier'] = `${config.resolverApi}/${query}`
        }
      });
      dispatch(setResolvedResources(data));
    } else {
      dispatch(setResolvedResources([]));
    }

    return response;
  };
};


// Redux store update for resolvedResources data.
export const setResolvedResources = (resolvedResources) => {
  return {
    type: 'SET_RESOLVEDRESOURCES',
    resolvedResources
  };
};