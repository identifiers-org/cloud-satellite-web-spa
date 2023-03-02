package org.identifiers.satellite.frontend.satellitewebspa.api.models;

import lombok.extern.slf4j.Slf4j;
import org.identifiers.cloud.libapi.models.resolver.ResolvedResource;
import org.identifiers.cloud.libapi.models.resolver.ServiceResponseResolve;
import org.identifiers.cloud.libapi.services.ApiServicesFactory;
import org.identifiers.satellite.frontend.satellitewebspa.api.exceptions.FailedResolutionException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.view.RedirectView;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Project: satellite-webspa
 * Package: org.identifiers.satellite.frontend.satellitewebspa.api.models
 * Timestamp: 2019-05-15 14:12
 *
 * @author Manuel Bernal Llinares <mbdebian@gmail.com>
 * ---
 */
@Component
@Slf4j
public class ResolutionApiModel {
    public RedirectView resolveRawCompactIdentifier(ServiceResponseResolve responseResolve) {
        if (responseResolve.getHttpStatus().is2xxSuccessful()) {
            String location;
            if (!responseResolve.getPayload().getResolvedResources().isEmpty()) {
                // We have resources
                if (responseResolve.getPayload().getParsedCompactIdentifier().isDeprecatedNamespace()) {
                    // The namespace is deprecated, we just choose among its resources, just in case they're all not deprecated, we sort them
                    responseResolve.getPayload().getResolvedResources().sort((o1, o2) -> Integer.compare(o2.getRecommendation().getRecommendationIndex(), o1.getRecommendation().getRecommendationIndex()));
                    location = responseResolve.getPayload().getResolvedResources().get(0).getCompactIdentifierResolvedUrl();
                    log.info("Resolving to {}", location);
                } else {
                    // The namespace is ACTIVE, so we filter out the deprecated resources
                    List<ResolvedResource> activeResolvedResources =
                            responseResolve.getPayload().getResolvedResources().stream().filter(resolvedResource -> !resolvedResource.isDeprecatedResource()).collect(Collectors.toList());
                    if (!activeResolvedResources.isEmpty()) {
                        // We sort them and choose the highest ranking one
                        activeResolvedResources.sort((o1, o2) -> Integer.compare(o2.getRecommendation().getRecommendationIndex(), o1.getRecommendation().getRecommendationIndex()));
                        location = activeResolvedResources.get(0).getCompactIdentifierResolvedUrl();
                        log.info("Resolving to {}", location);
                    } else {
                        String errorMessage = String.format("Namespace '%s' is ACTIVE but ALL ITS RESOURCES ARE " +
                                "DEPRECATED",
                                responseResolve.getPayload().getParsedCompactIdentifier().getNamespace());
                        log.error(errorMessage);
                        throw new FailedResolutionException(errorMessage);
                    }
                }
                return new RedirectView(location);
            }
            throw new FailedResolutionException(String.format("Zero resources were found for %s",
                    responseResolve.getPayload().getParsedCompactIdentifier().getRawRequest()));
        }
        throw new FailedResolutionException(responseResolve.getErrorMessage());
//        return new ResponseEntity<>(responseResolve.getErrorMessage(), responseResolve.getHttpStatus());
    }
}
