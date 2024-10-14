plugins {
    kotlin("jvm") version "1.9.25"
    kotlin("plugin.spring") version "1.9.25"
    id("org.springframework.boot") version "3.3.3"
    id("io.spring.dependency-management") version "1.1.6"
    id("org.openapi.generator") version "7.8.0"
    id("org.sonarqube") version "5.0.0.4638"
    jacoco
}

group = "com.zufar"
version = "0.0.1"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
}

sonar {
    properties {
        property("sonar.projectKey", "shorty-url")
        property("sonar.projectName", "ShortyURL")
    }
}

val springCloudVersion = "2023.0.3"
val mockitoVersion = "5.13.0"
val mockitoKotlinVersion = "5.4.0"
val springdocVersion = "2.6.0"
val javaxValidationApiVersion = "2.0.1.Final"
val commonsValidatorVersion = "1.9.0"

dependencies {
    // Spring Boot MVC
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-actuator")

    // Database
    implementation("org.springframework.boot:spring-boot-starter-data-mongodb")

    // Security
    implementation("org.springframework.boot:spring-boot-starter-security")

    // JWT
    implementation("io.jsonwebtoken:jjwt-api:0.11.5")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.11.5")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.11.5")

    // Password Encoding
    implementation("org.springframework.security:spring-security-crypto")

    // Logging
    implementation("org.springframework.boot:spring-boot-starter-logging")

    // Jackson
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")

    // OpenAPI
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:$springdocVersion")
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-api:$springdocVersion")

    // Validation
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("javax.validation:validation-api:$javaxValidationApiVersion")
    implementation("commons-validator:commons-validator:$commonsValidatorVersion")

    // Lombok
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")

    // Testing
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.mockito:mockito-core:$mockitoVersion")
    testImplementation("org.mockito.kotlin:mockito-kotlin:$mockitoKotlinVersion")
    testImplementation("org.jetbrains.kotlin:kotlin-test")
}

dependencyManagement {
    imports {
        mavenBom("org.springframework.cloud:spring-cloud-dependencies:$springCloudVersion")
    }
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict")
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}

sonarqube {
    properties {
        property("sonar.projectKey", "Sunagatov_URL-Shortener")
        property("sonar.organization", "zufar")
        property("sonar.host.url", "https://sonarcloud.io")
        property("sonar.login", System.getenv("SHORTY_URL_SONAR_TOKEN"))
        property("sonar.sources", "src/main/kotlin")
        property("sonar.tests", "src/test/kotlin")
        property("sonar.language", "kotlin")
        property("sonar.kotlin.detekt.reportPaths", "build/reports/detekt")
        property("sonar.jacoco.reportPaths", "${layout.buildDirectory}/jacoco/test.exec")
    }
}

tasks.named("sonarqube") {
    dependsOn("jacocoTestReport") // Ensure JaCoCo report is generated before SonarCloud analysis
}

openApiGenerate {
    generatorName.set("kotlin")
    inputSpec.set("$projectDir/src/main/resources/openapi/shorten-url-api.yaml")
    outputDir.set("${layout.buildDirectory}/generated/api")
    apiPackage.set("com.zufar.urlshortener.api")
    modelPackage.set("com.zufar.urlshortener.dto")
    configOptions.put("useJakartaEe", "true")
    configOptions.put("interfaceOnly", "true")
    configOptions.put("useTags", "true")
}

sourceSets {
    main {
        kotlin {
            srcDirs("${layout.buildDirectory}/generated/api/src/main/kotlin")
        }
    }
}

tasks.named("compileKotlin") {
    dependsOn(tasks.named("openApiGenerate"))
}

jacoco {
    toolVersion = "0.8.10"
}
tasks.jacocoTestReport {
    reports {
        xml.required.set(true)
        html.required.set(true)
    }
}