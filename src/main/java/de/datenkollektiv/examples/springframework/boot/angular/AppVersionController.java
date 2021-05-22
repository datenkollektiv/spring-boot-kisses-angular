package de.datenkollektiv.examples.springframework.boot.angular;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/server/*")
public class AppVersionController {

    private static final Logger LOG = LoggerFactory.getLogger(AppVersionController.class);

    @GetMapping("version")
    public @ResponseBody
    AppVersion version() {
        LOG.info("Serving 'version' request");
        return new AppVersion().withNumber("42");
    }
}
