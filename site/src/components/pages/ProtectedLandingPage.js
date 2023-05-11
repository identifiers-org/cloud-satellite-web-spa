import React, { useState } from 'react';
import { Navigate, useParams } from "react-router-dom";
import { config } from "../../config/Config";
import Spinner from "../common/Spinner";

const ProtectedLandingPage = () => {

  const [{resolvedResource, failed}, setState] = useState({
      resolvedResource: null,
      failed: false
    }
  )
  const cid = useParams()["*"]
  const resolverQueryUrl = new URL("/" + cid, config.resolverApi);

  if (failed) { //Failed load
    return <Navigate to="/error"/>
  } else if (!resolvedResource) { //Not loaded nor failed load
    fetchResource(resolverQueryUrl, setState)
    return <Spinner/>
  } else if (resolvedResource.protectedUrls) {
    return <ProtectedLandingPageContents {...resolvedResource} />
  } else { //Best resource is not protected
    return <Navigate to="/error" />
  }
}
export default ProtectedLandingPage;

const fetchResource = (resolverQueryUrl, setState) => {
  fetch(resolverQueryUrl)
    .catch(err => {
      console.log(err)
      setState({failed: true, resolvedResource: null})
    })
    .then(response => response.json())
    .then(jsonResponse => {
      const { resolvedResources, parsedCompactIdentifier } = jsonResponse.payload
      if (!resolvedResources || resolvedResources.length === 0) {
        setState({failed: true, resolvedResource: null})
      } else {
        const maxRecommendationResource = resolvedResources.reduce((currBest, current) => {
          if (currBest.recommendation.recommendationIndex < current.recommendation.recommendationIndex)
            return current
          else
            return currBest
        })
        setState({
          resolvedResource: {...maxRecommendationResource, namespace: parsedCompactIdentifier.namespace},
          failed: false
        })
      }
    })
}

const ProtectedLandingPageContents = (resolvedResource) =>
  <>
    <h1 className="text-primary mb-4 text-center">The page that you are trying to access requires authentication</h1>
    <p>
      The resource you are trying to access a protected resource of namespace <em className="font-weight-bold">{resolvedResource.namespace}</em>.
      Before accessing its information you will need proper authorization.
    </p>
    <p> {resolvedResource.authHelpDescription} </p>
    <div className="d-flex flex-wrap" style={{gap: ".25rem"}}>
      <a className="btn btn-primary text-white flex-fill" href={resolvedResource.compactIdentifierResolvedUrl}>
        <em className="font-weight-bold">I understand</em>, take me to <br className="d-inline d-sm-none"/>
        {resolvedResource.compactIdentifierResolvedUrl}
      </a>
      <a target="_blank" className="btn btn-primary text-white flex-fill" href={resolvedResource.authHelpUrl}>
        <em className="font-weight-bold">I need more information</em>, take me to <br className="d-inline d-sm-none"/>
        {resolvedResource.authHelpUrl}
      </a>
    </div>
  </>
