[![Last Commit](https://img.shields.io/github/last-commit/datenkollektiv/spring-boot-kisses-angular?style=flat)](https://github.com/datenkollektiv/spring-boot-kisses-angular/commits/)

# Spring Boot kisses Angular 4+

> Update: The project has been migrated to Spring Boot 2.3 and Angular 9.

With a strong Java and Spring Framework background and looking around in the JavaScript world it seems natural to reach out into a new technology by integrating it into a know build chain.

This repo is a companion of
* [Update of the Spring Boot + Angular Example](https://devops.datenkollektiv.de/update-of-the-spring-boot-angular-example.html),
* [Spring Boot kisses Angular 4](https://devops.datenkollektiv.de/spring-boot-kisses-angular-4.html) and
* [Migrating from Angular HttpModule to new Angular 4.3 HttpClientModule](https://devops.datenkollektiv.de/migrating-from-angular-httpmodule-to-new-angular-43-httpclientmodule.html)

> Note: The [Online Spring Boot Banner Generator](https://devops.datenkollektiv.de/banner.txt/index.html) has emerged from this template...please have a look at [Create Your Own Spring Boot Banner](https://devops.datenkollektiv.de/create-your-own-spring-boot-banner.html) for more details.

## Build Docker/OCI image

```sh
gradle jibDockerBuild
```

> Note: This command requires a Docker daemon to be present locally.
> For other options please refer to the [Gradle](https://gradle.org/) plugin [GoogleContainerTools/jib](https://github.com/GoogleContainerTools/jib)

```sh
docker run -it -p 8080:8080 --name spring-boot-kisses-angular datenkollektiv/spring-boot-kisses-angular:0.4.0
```

Point your browser to [http://localhost:8080/app/index.htm](http://localhost:8080/app/index.htm) to access app `42`.
