package org.identifiers.satellite.frontend.satellitewebspa.api.models;

import lombok.extern.slf4j.Slf4j;
import org.identifiers.cloud.libapi.models.resolver.ResolvedResource;
import org.identifiers.cloud.libapi.models.resolver.ServiceResponseResolve;
import org.identifiers.cloud.libapi.services.ApiServicesFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

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
    @Value("${org.identifiers.satellite.frontend.satellitewebspa.config.ws.resolver.host}")
    private String resolverHost;

    @Value("${org.identifiers.satellite.frontend.satellitewebspa.config.ws.resolver.port}")
    private String resolverPort;

    // TODO specifying HTTP or HTTPs is not supported by the libapi yet
    @Value("${org.identifiers.satellite.frontend.satellitewebspa.config.ws.resolver.schema}")
    private String resolverSchema;

    public ResponseEntity<?> resolveRawCompactIdentifier(String rawCompactIdentifier) {
        ServiceResponseResolve responseResolve =
                ApiServicesFactory.getResolverService(resolverHost, resolverPort)
                        .requestResolutionRawRequest(rawCompactIdentifier);
        if (responseResolve.getHttpStatus().is2xxSuccessful()) {
            // If the namespace is deprecated, we perform the resolution as always, because all its resources should be
            // deprecated, thus, redirecting to any of them will report the situation to the user
            // If the namespace is not deprecated, we should exclude deprecated resources from the redirection choices.
            // Choose the highest ranking resource
            try {
                // Return redirect
                HttpHeaders headers = new HttpHeaders();
                if (!responseResolve.getPayload().getResolvedResources().isEmpty()) {
                    // We have resources
                    if (responseResolve.getPayload().getParsedCompactIdentifier().isDeprecatedNamespace()) {
                        // The namespace is deprecated, we just choose among its resources, just in case they're all not deprecated, we sort them
                        responseResolve.getPayload().getResolvedResources().sort((o1, o2) -> Integer.compare(o2.getRecommendation().getRecommendationIndex(), o1.getRecommendation().getRecommendationIndex()));
                        headers.setLocation(new URI(responseResolve.getPayload().getResolvedResources().get(0).getCompactIdentifierResolvedUrl()));
                    } else {
                        // The namespace is ACTIVE, so we filter out the deprecated resources
                        List<ResolvedResource> activeResolvedResources =
                                responseResolve.getPayload().getResolvedResources().stream().filter(resolvedResource -> !resolvedResource.isDeprecatedResource()).collect(Collectors.toList());
                        if (!activeResolvedResources.isEmpty()) {
                            // We sort them and choose the highest ranking one
                            activeResolvedResources.sort((o1, o2) -> Integer.compare(o2.getRecommendation().getRecommendationIndex(), o1.getRecommendation().getRecommendationIndex()));
                            headers.setLocation(new URI(activeResolvedResources.get(0).getCompactIdentifierResolvedUrl()));
                        } else {
                            String errorMessage = String.format("Namespace '%s' is ACTIVE but ALL ITS RESOURCES ARE " +
                                    "DEPRECATED",
                                    responseResolve.getPayload().getParsedCompactIdentifier().getNamespace());
                            log.error(errorMessage);
                            return new ResponseEntity<>(errorMessage, HttpStatus.NOT_FOUND);
                        }
                    }
                    return new ResponseEntity<>("", headers, HttpStatus.FOUND);
                }
                return new ResponseEntity<>("", HttpStatus.NOT_FOUND);
            } catch (URISyntaxException e) {
                String errorMessage = String.format("Compact Identifiers '%s' resolved to provider with internal ID " +
                                "'%d', " +
                                "description '%s', " +
                                "institution '%s', " +
                                "with an INVALID RESOLVED URL '%s'",
                        rawCompactIdentifier,
                        responseResolve.getPayload().getResolvedResources().get(0).getId(),
                        responseResolve.getPayload().getResolvedResources().get(0).getDescription(),
                        responseResolve.getPayload().getResolvedResources().get(0).getInstitution(),
                        responseResolve.getPayload().getResolvedResources().get(0).getCompactIdentifierResolvedUrl());
                log.error(errorMessage);
                return new ResponseEntity<>(errorMessage, HttpStatus.BAD_REQUEST);
            }
        }
        return new ResponseEntity<>(responseResolve.getErrorMessage(), responseResolve.getHttpStatus());
    }
}
