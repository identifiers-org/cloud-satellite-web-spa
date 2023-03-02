package org.identifiers.satellite.frontend.satellitewebspa.api.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.NOT_FOUND, reason = "Requested CID could not be found")
public class FailedResolutionException extends RuntimeException {
    public FailedResolutionException() {}
    public FailedResolutionException(String message) {
        super(message);
    }
}
