package de.datenkollektiv.examples.springframework.boot.angular;

import org.springframework.boot.info.BuildProperties;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Objects;

@RestController
@RequestMapping("/server")
public class AppVersionController {

    private static final String UNKNOWN = "unknown";

    private final BuildProperties buildProperties;

    public AppVersionController(BuildProperties buildProperties) {
        this.buildProperties = buildProperties;
    }

    @GetMapping("/version")
    public AppVersion version() {
        String number = Objects.toString(buildProperties.getVersion(), UNKNOWN);
        Instant time = buildProperties.getTime();
        String buildDate = time != null ? time.toString() : UNKNOWN;
        return new AppVersion(number, buildDate);
    }
}
