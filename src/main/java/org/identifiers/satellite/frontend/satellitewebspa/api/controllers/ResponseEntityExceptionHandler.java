package org.identifiers.satellite.frontend.satellitewebspa.api.controllers;

import org.identifiers.satellite.frontend.satellitewebspa.api.exceptions.FailedResolutionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@ControllerAdvice
public class ResponseEntityExceptionHandler extends org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(ResponseEntityExceptionHandler.class);

    @ExceptionHandler(value = { Exception.class })
    protected ModelAndView handleConflict(Exception ex, HttpServletResponse response) throws Exception {
        // Last hope for logging of unforeseen errors
        // Also a way to make all responses to be of type ServiceResponse
        logger.error("Unforeseen exception", ex);
//        return new RedirectView(newPath);
        response.addCookie(new Cookie("message", URLEncoder.encode(ex.getMessage())));
        return new ModelAndView("/index.html", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(value = { FailedResolutionException.class })
    protected ModelAndView FailedResolution(FailedResolutionException ex, HttpServletResponse response) throws UnsupportedEncodingException {//, HttpServletRequest request) {
        // Last hope for logging of unforeseen errors
        // Also a way to make all responses to be of type ServiceResponse
//        String newPath = UriComponentsBuilder.fromHttpUrl(request.getRequestURL().toString())
//                .queryParam("message", ex.getMessage())
//                .build().toString();
//        logger.debug("redirecting to: {}", newPath);
//        return new RedirectView(newPath);
        String encodedMessage = URLEncoder.encode(ex.getMessage(), StandardCharsets.UTF_8.toString());
        String cookieVal = String.format("message=%s; SameSite=None", encodedMessage);
        response.addHeader("Set-Cookie", cookieVal);
        response.addHeader("Set-Cookie", "title=Resolution+failed; SameSite=None");
        return new ModelAndView("/index.html", HttpStatus.NOT_FOUND);
    }
}
