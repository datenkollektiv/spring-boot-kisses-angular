[![Last Commit](https://img.shields.io/github/last-commit/datenkollektiv/spring-boot-kisses-angular?style=flat)](https://github.com/datenkollektiv/spring-boot-kisses-angular/commits/)

# Spring Boot kisses Angular

> Update: The project has been migrated to Spring Boot 4.0.x, Java 21, and Angular 21.

> Note: Parts of this project were developed and maintained with the assistance of AI tools.
> All generated code has been reviewed and curated by the maintainer.

## Technology Stack

| Component   | Version    |
|:------------|:-----------|
| Angular     | 21.x       |
| Spring Boot | 4.0.x      |
| Java        | 21         |
| Node.js     | 24.x       |
| TypeScript  | 5.9.x      |
| Build Tool  | Gradle 9.x |

With a strong Java and Spring Framework background and looking around in the JavaScript world, it seems natural to reach out into a new technology by integrating it into a known build chain.

This repo is a companion of
* [Update of the Spring Boot + Angular Example](https://devops.datenkollektiv.de/update-of-the-spring-boot-angular-example.html),
* [Spring Boot kisses Angular 4](https://devops.datenkollektiv.de/spring-boot-kisses-angular-4.html) and
* [Migrating from Angular HttpModule to new Angular 4.3 HttpClientModule](https://devops.datenkollektiv.de/migrating-from-angular-httpmodule-to-new-angular-43-httpclientmodule.html)

> Note: The [Online Spring Boot Banner Generator](https://devops.datenkollektiv.de/banner.txt/index.html) has emerged from this template...please have a look at [Create Your Own Spring Boot Banner](https://devops.datenkollektiv.de/create-your-own-spring-boot-banner.html) for more details.

## Quick Start

```sh
./gradlew bootRun
```

Then open [http://localhost:8080/app/index.html](http://localhost:8080/app/index.html) in your browser.

## Build (clean) Docker/OCI image locally

```sh
./gradlew clean -Dplatform.architecture=arm64 jibDockerBuild
```

> Note: This command requires a Docker daemon to be present locally.
> For other options please refer to the [Gradle](https://gradle.org/) plugin [GoogleContainerTools/jib](https://github.com/GoogleContainerTools/jib)

```sh
export ARCH_POSTFIX=".arm64"
open http://localhost:8080/app/index.html
docker run --rm -p 8080:8080 --name spring-boot-kisses-angular datenkollektiv/spring-boot-kisses-angular:0.6.0${ARCH_POSTFIX}
```

Point your browser to [http://localhost:8080/app/index.html](http://localhost:8080/app/index.html) and access the app version.

## Maintenance

Check for npm vulnerabilities:

```sh
./gradlew npmAudit
```

Fix npm vulnerabilities automatically:

```sh
./gradlew npmAuditFix
```
