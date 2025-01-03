package com.example.expenseSplitterApp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.MongoTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

//Enabling DB Transaction Management In TransactionConfig and making it a configuration class:
@EnableTransactionManagement
@Configuration
public class TransactionConfig {
    //We've have to create and configure a bean which would tell Spring Boot that
    // MongoTransactionManager(predefined) is an Implementation Of PlatformTransactionManager(predefined) for
    // activating Transaction Management In Our Web App

    @Bean
    public PlatformTransactionManager transactionContextImplementation(MongoDatabaseFactory dbFactory){
        //MongoDatabaseFactory enables us to connect with the mongodb database.
        return new MongoTransactionManager(dbFactory);
    }
}
