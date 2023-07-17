package org.identifiers.satellite.frontend.satellitewebspa.filters;


import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

/**
 * Project: satellite-webspa
 * Package: org.identifiers.satellite.frontend.satellitewebspa.filters
 * Timestamp: 2019-05-17 07:29
 *
 * @author Manuel Bernal Llinares <mbdebian@gmail.com>
 * ---
 */
@Component
@Slf4j
@Order(1)
public class StaticAndResolutionFilter implements Filter {
    @Autowired
    private ResourceLoader resourceLoader;

    private boolean doesResourceExists(String path) {
        Resource resource = resourceLoader.getResource("classpath:/static" + path);
        return resource.exists();
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        log.debug("Running my custom filter");
        HttpServletRequest req = (HttpServletRequest) servletRequest;
        String path = req.getRequestURI().substring(req.getContextPath().length());
        if (doesResourceExists(path)) {
            log.debug("Delegate to default - path '{}'", path);
            filterChain.doFilter(servletRequest, servletResponse); // Goes to default servlet.
        } else if ((path.startsWith("/resolve")) || (path.startsWith("/protectedLanding"))) {
            log.debug("Delegate to index.html (SPA routing) - path '{}'", path);
            servletRequest.getRequestDispatcher("/index.html").forward(servletRequest, servletResponse);
        } else if ((path.startsWith("/devopsApi")) || (path.startsWith("/healthApi"))) {
            log.debug("Delegate to my handlers - path '{}'", path);
            filterChain.doFilter(servletRequest, servletResponse);
        } else {
            String newPath = "/resolutionApi" + path;
            log.debug("Sending the request to the resolution API - path '{}'", newPath);
            servletRequest.getRequestDispatcher(newPath).forward(servletRequest, servletResponse); // Goes to your
        }
    }
}
