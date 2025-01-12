package com.example.expenseSplitterApp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
public class AdminConfig {

    @Value("${admin-empids}")
    private String adminEmpIds;

    public List<String> getAdminEmpIds() {
        // Convert the comma-separated string into a list of strings
        return Arrays.asList(adminEmpIds.split(","));
    }
}
