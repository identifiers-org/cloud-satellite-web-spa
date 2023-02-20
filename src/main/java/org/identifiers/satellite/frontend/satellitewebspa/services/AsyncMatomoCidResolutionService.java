package org.identifiers.satellite.frontend.satellitewebspa.services;

import lombok.extern.slf4j.Slf4j;
import org.identifiers.cloud.libapi.models.resolver.ResponseResolvePayload;
import org.identifiers.cloud.libapi.models.ServiceResponse;
import org.identifiers.cloud.libapi.models.resolver.ParsedCompactIdentifier;
import org.identifiers.cloud.libapi.models.resolver.ResolvedResource;
import org.matomo.java.tracking.MatomoRequest;
import org.matomo.java.tracking.MatomoRequestBuilder;
import org.matomo.java.tracking.MatomoTracker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import java.util.*;

@Slf4j
@Component
public class AsyncMatomoCidResolutionService {
    @Value("${org.identifiers.matomo.authToken}")
    String authToken;

    @Value("${org.identifiers.matomo.enabled}")
    public boolean isEnabled;

    @Autowired
    MatomoTracker idorgMatomoTracker;

    private class MatomoRequestImportantInfo {
        public String url, xforwarded_for, remote_addr, ua, lang, refe;
        public List<ResolvedResource> resolvedResources;
        public ParsedCompactIdentifier parsed_cid;
        public boolean wasResolutionSuccessfull;

        MatomoRequestImportantInfo(final HttpServletRequest request, final ServiceResponse<ResponseResolvePayload> result) {
            url = request.getRequestURL().toString();
            xforwarded_for = request.getHeader("X-FORWARDED-FOR");
            remote_addr = request.getRemoteAddr();
            ua = request.getHeader("user-agent");
            lang = request.getHeader("Accept-Language");
            refe = request.getHeader("Referer");

            ResponseResolvePayload resolveResult = result.getPayload();
            parsed_cid = resolveResult.getParsedCompactIdentifier();
            resolvedResources = resolveResult.getResolvedResources();

            wasResolutionSuccessfull = result.getHttpStatus().is2xxSuccessful();
        }
    }

    public void asyncHandleCidResolution(final HttpServletRequest request, final ServiceResponse<ResponseResolvePayload> result) {
        if (!isEnabled) {
            log.debug("Matomo is disabled");
        } else if (request.getHeader("DNT") != null &&
                request.getHeader("DNT").contains("1")) {
            log.debug("Skipping matomo notification - DoNotTrack");
        } else {
            doHandleCidResolution(new MatomoRequestImportantInfo(request, result));
        }
    }

    @Async("matomoThreadPoolTaskExecutor")
    private void doHandleCidResolution(MatomoRequestImportantInfo info) {
        MatomoRequestBuilder mreq = MatomoRequest.builder().siteId(1);

        mreq.actionUrl(info.url);
//        mreq.trackBotRequests(true);

        List<MatomoRequest> requests = new ArrayList<>(2);

        setHttpHeadersOnRequest(info, mreq);
        mreq.actionName("Resolution/Query");
        mreq.newVisit(true);
        requests.add(0, mreq.build());

        if (info.wasResolutionSuccessfull) {
            setResolutionResultOnRequest(info, mreq);
            mreq.actionName("Resolution/Redirect");
            mreq.newVisit(false);
            requests.add(1, mreq.build());
        }

        idorgMatomoTracker.sendBulkRequestAsync(requests);
    }

    private void setHttpHeadersOnRequest(final MatomoRequestImportantInfo info, MatomoRequestBuilder mreq) {
        if (authToken != null && !authToken.isEmpty()) {
            mreq.authToken(authToken);
            String remoteIP = info.xforwarded_for;
            if (remoteIP == null || remoteIP.isEmpty()) {
                remoteIP = info.remote_addr;
            }
            mreq.visitorIp(remoteIP);
        } else {
            log.debug("No auth token => no ip collection");
        }
        mreq.headerUserAgent(info.ua);
        mreq.headerAcceptLanguage(info.lang);
        mreq.referrerUrl(info.refe);
    }

    Comparator<ResolvedResource> resolvedResourceComparator = (o1, o2) ->
        o1.getRecommendation().getRecommendationIndex() - o2.getRecommendation().getRecommendationIndex();

    private void setResolutionResultOnRequest(MatomoRequestImportantInfo info, MatomoRequestBuilder mreq) {
        ResolvedResource maxResolvedResource = info.resolvedResources.stream()
                .max(resolvedResourceComparator).orElse(null);
        if (maxResolvedResource != null) {
            mreq.outlinkUrl(maxResolvedResource.getCompactIdentifierResolvedUrl());
        }

        Map<String, Object> customData = new HashMap<>();
        if (info.parsed_cid != null) {
            customData.put("dimension6", info.parsed_cid.getNamespace() == null ? "" : info.parsed_cid.getNamespace());
            customData.put("dimension7", info.parsed_cid.getProviderCode() == null ? "" : info.parsed_cid.getProviderCode());
        }
        customData.put("dimension8", info.resolvedResources.size());
        if (maxResolvedResource != null) {
            customData.put("dimension9", maxResolvedResource.getInstitution().getName());
            customData.put("dimension10", maxResolvedResource.isOfficial());
//            customData.put("dimention6", maxResolvedResource.isDeprecatedResource()); // Need to find how to add this
        }
        mreq.customTrackingParameters(customData);
    }
}
