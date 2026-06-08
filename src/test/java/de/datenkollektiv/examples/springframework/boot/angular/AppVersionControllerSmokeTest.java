package de.datenkollektiv.examples.springframework.boot.angular;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;
import static org.springframework.http.HttpStatus.OK;

@SpringBootTest(classes = AngularApplication.class, webEnvironment = RANDOM_PORT)
@AutoConfigureTestRestTemplate
class AppVersionControllerSmokeTest {

    @LocalServerPort
    private int port;

    @Autowired
    protected TestRestTemplate restTemplate;

    @Test
    void shouldServeAppVersion() {
        ResponseEntity<AppVersion> response = this.restTemplate.getForEntity("http://localhost:" + port + "/server/version", AppVersion.class);

        assertThat(response.getStatusCode()).isEqualTo(OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().number())
                .as("version must be served from build metadata, not the legacy placeholder")
                .isNotBlank()
                .isNotEqualTo("42");
        assertThat(response.getBody().buildDate()).isNotBlank();
    }
}
