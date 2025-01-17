package com.example.expenseSplitterApp.scheduler;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@Slf4j
public class ServerSleepPreventionModelScheduler {
    private static final String API_URL = "https://expense-splitter-app-backend.onrender.com/api/health-check";

    @Autowired
    private RestTemplate restTemplate;

    //    @Scheduled(cron = "*/10 * * * * *")

    // Schedule to run every 14 minutes
    @Scheduled(cron = "0 */14 * * * *")
    public void sendHealthCheckRequest() {
        try {
            restTemplate.exchange(API_URL, HttpMethod.GET, null, Void.class); // Sending request without collecting a response
            log.info("Health check request sent successfully at " + System.currentTimeMillis());
        } catch (Exception e) {
            log.error("Error during health check request: " + e.getMessage());
        }
    }
}
