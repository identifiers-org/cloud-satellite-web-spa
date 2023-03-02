package org.identifiers.satellite.frontend.satellitewebspa.api.controllers;

import lombok.extern.slf4j.Slf4j;
import org.identifiers.cloud.libapi.models.resolver.ServiceResponseResolve;
import org.identifiers.cloud.libapi.services.ApiServicesFactory;
import org.identifiers.satellite.frontend.satellitewebspa.api.models.ResolutionApiModel;
import org.identifiers.satellite.frontend.satellitewebspa.services.AsyncMatomoCidResolutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.HandlerMapping;
import org.springframework.web.servlet.view.RedirectView;

import javax.servlet.http.HttpServletRequest;

/**
 * Project: satellite-webspa
 * Package: org.identifiers.satellite.frontend.satellitewebspa.api.controllers
 * Timestamp: 2019-05-16 10:19
 *
 * @author Manuel Bernal Llinares <mbdebian@gmail.com>
 * ---
 */
//@RestController
@RestController
@RequestMapping("resolutionApi")
@Slf4j
public class ResolutionApiController {
    @Autowired
    private ResolutionApiModel model;

    @Value("${org.identifiers.satellite.frontend.satellitewebspa.config.ws.resolver.host}")
    private String resolverHost;

    @Value("${org.identifiers.satellite.frontend.satellitewebspa.config.ws.resolver.port}")
    private String resolverPort;

    @Autowired
    AsyncMatomoCidResolutionService matomoService;

    @RequestMapping(value = "/{resolutionRequest}/**", method = RequestMethod.GET)
    public RedirectView resolveRawCompactIdentifier(@PathVariable String resolutionRequest, HttpServletRequest request) {
        // Extract the request path
        final String path =
                request.getAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE).toString();

        String rawCompactIdentifier = path.replaceFirst("/resolutionApi/", "");

        log.info("Resolution request CID: '{}'", rawCompactIdentifier);

        ServiceResponseResolve responseResolve =
                ApiServicesFactory.getResolverService(resolverHost, resolverPort)
                        .requestResolutionRawRequest(rawCompactIdentifier);

        matomoService.asyncHandleCidResolution(request, responseResolve);

        return model.resolveRawCompactIdentifier(responseResolve);
    }
}
