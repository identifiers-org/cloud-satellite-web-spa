import React, { Suspense, } from 'react';
import { Await, useLoaderData } from "react-router-dom";
import Spinner from "../common/Spinner";
import ErrorPage from "./ErrorPage";


export default () => {
  const { resolverData } = useLoaderData();

  return (
    <Suspense fallback={<Spinner />}>
      <Await
        resolve={ resolverData }
        children={ ProtectedLanding }
      />
    </Suspense>
  )
}


const ProtectedLanding = (resolverData) => {
  const { payload: { resolvedResources } } = resolverData;

  const bestResolvedResource = resolvedResources.reduce(
    (best, curr) => {
      if (best === null) return curr;
      const best_idx = best.recommendation.recommendation_index;
      const curr_idx = curr.recommendation.recommendation_index;
      return best_idx < curr_idx ? curr : best;
    }, null);

  if (bestResolvedResource === null)
    return <ErrorPage defaultMessage={"Invalid compact identifier"} />;
  if (!bestResolvedResource.protectedUrls || !bestResolvedResource.renderProtectedLanding)
    return <ErrorPage defaultMessage={"Invalid compact identifier for protected landing"} />;

  return <ProtectedLandingPageContents {...bestResolvedResource} />
}


const ProtectedLandingPageContents = resolvedResource =>
  <>
    <h1 className="text-primary mb-4 text-center">The page that you are trying to access requires authentication</h1>
    <p className="text-center">
      You are trying to access a protected resource of namespace <em className="font-weight-bold">{resolvedResource.namespacePrefix}</em>.
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
