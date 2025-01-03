package com.example.expenseSplitterApp.api.response;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class ExchangeRateResponse {
    private Map<String, Double> data;
}
