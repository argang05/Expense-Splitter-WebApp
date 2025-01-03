package com.example.expenseSplitterApp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
public class ExpenseSplitterApp {

	public static void main(String[] args) {
		SpringApplication.run(ExpenseSplitterApp.class, args);
	}

	//Creating an instance/implementation of RestTemplate To avoid errors:
	@Bean
	public RestTemplate restTemplate(){
		return new RestTemplate();
	}

}
