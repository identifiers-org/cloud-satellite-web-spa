package org.identifiers.satellite.frontend.satellitewebspa.api.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

//@Controller
public class ErrorController {

//    @RequestMapping(value = "/error")
    public String handleError() {
        return "index.html";
    }
}
