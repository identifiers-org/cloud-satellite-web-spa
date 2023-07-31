import React, { Suspense } from "react";
import { useLoaderData, Await } from "react-router-dom";
import Spinner from "../common/Spinner";
import ErrorPage from "./ErrorPage";
import { config } from "../../config/Config";


export default () => {
  const { resolverData } = useLoaderData();

  return (
    <Suspense fallback={<Spinner />}>
      <Await
        resolve={ resolverData }
        children={ DeactivatedLanding }
      />
    </Suspense>
  )
}


const allDeprecatedResource = resolvedResources => {
  resolvedResources.every(resource => resource.deprecatedResource)
}


const DeactivatedLanding = (resolverData) => {
  const {
    payload: {
      parsedCompactIdentifier,
      resolvedResources
    }
  } = resolverData;

  if (!parsedCompactIdentifier.deprecatedNamespace && !allDeprecatedResource(resolvedResources))
    return <ErrorPage defaultMessage={"Invalid compact identifier for deactivated landing"} />;

  const registryPageUrl = `${config.registryUrl}/registry/${parsedCompactIdentifier.namespace}`;

  const bestResolvedUrl = resolvedResources.reduce(
    (best, curr) => {
      if (best === null) return curr;
      const best_idx = best.recommendation.recommendation_index;
      const curr_idx = curr.recommendation.recommendation_index;
      return best_idx < curr_idx ? curr : best;
    }, null).compactIdentifierResolvedUrl;

  return <DeactivatedLandingContents registryPageUrl={registryPageUrl}
                                     bestResolvedUrl={bestResolvedUrl}
                                     namespace={parsedCompactIdentifier.namespace} />
}


const DeactivatedLandingContents = ({ namespace, registryPageUrl, bestResolvedUrl }) => <>
  <h1 className="text-danger mb-4 text-center">
    <i className="icon icon-common icon-trash" />
    <span className="mx-2">The namespace {namespace} has been deactivated</span>
    <i className="icon icon-common icon-trash" />
  </h1>
  <p className="text-center"> Due to it not being supported anymore or because it is not available online anymore. </p>

  <div className="d-flex flex-wrap" style={{gap: ".25rem"}}>
    <a className="btn btn-primary text-white flex-fill"  href={registryPageUrl}>
      <em className="font-weight-bold">
        Go to the registry's page for more information
      </em> <br className="d-inline d-sm-none"/>
      {registryPageUrl}
    </a>
    <a target="_blank" className="btn btn-primary text-white flex-fill" href={bestResolvedUrl}>
      <em className="font-weight-bold">
        Go to latest available online location
      </em> <br className="d-inline d-sm-none"/>
      {bestResolvedUrl}
    </a>
  </div>
</>