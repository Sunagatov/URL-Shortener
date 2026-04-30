plugins {
    kotlin("jvm") version "2.3.21"
    kotlin("plugin.spring") version "2.3.21"
    id("org.springframework.boot") version "4.0.6"
    id("io.spring.dependency-management") version "1.1.7"
    id("org.sonarqube") version "7.3.0.8198"
    jacoco
}

group = "com.zufar"
version = "0.0.1"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
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

val mockitoVersion = "5.23.0"
val mockitoKotlinVersion = "6.3.0"
val springdocVersion = "3.0.3"
val commonsValidatorVersion = "1.10.1"
val caffeineVersion = "3.2.3"
val bucket4jVersion = "8.10.1"
val jjwtApiVersion = "0.13.0"
val logstashLogbackEncoderVersion = "9.0"


dependencies {
    // Spring Boot MVC
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-actuator")

    // Database
    implementation("org.springframework.boot:spring-boot-starter-data-mongodb")

    // Security
    implementation("org.springframework.boot:spring-boot-starter-security")

    // JWT
    implementation("io.jsonwebtoken:jjwt-api:$jjwtApiVersion")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:$jjwtApiVersion")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:$jjwtApiVersion")

    // Password Encoding
    implementation("org.springframework.security:spring-security-crypto")

    // Logging
    implementation("org.springframework.boot:spring-boot-starter-logging")
    implementation("net.logstash.logback:logstash-logback-encoder:$logstashLogbackEncoderVersion")

    // Jackson
    implementation("tools.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")

    // OpenAPI
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-scalar:$springdocVersion")

    // Validation
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("commons-validator:commons-validator:$commonsValidatorVersion") {
        exclude(group = "commons-logging", module = "commons-logging")
    }

    // Caching
    implementation("org.springframework.boot:spring-boot-starter-cache")
    implementation("com.github.ben-manes.caffeine:caffeine:$caffeineVersion")

    // Rate Limiting
    implementation("com.bucket4j:bucket4j-core:$bucket4jVersion")

    // Monitoring
    implementation("io.micrometer:micrometer-registry-prometheus")

    // Testing
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
    testImplementation("org.mockito:mockito-core:$mockitoVersion")
    testImplementation("org.mockito.kotlin:mockito-kotlin:$mockitoKotlinVersion")
    testImplementation("org.jetbrains.kotlin:kotlin-test")
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll(
            "-Xjsr305=strict",
            "-Xannotation-default-target=param-property"
        )
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}

tasks.named<Jar>("jar") {
    enabled = false
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

sourceSets {
    main {
        kotlin {
            srcDir(layout.buildDirectory.dir("generated/api/src/main/kotlin"))
        }
    }
}

jacoco {
    toolVersion = "0.8.14"
}
tasks.jacocoTestReport {
    reports {
        xml.required.set(true)
        html.required.set(true)
    }
}
