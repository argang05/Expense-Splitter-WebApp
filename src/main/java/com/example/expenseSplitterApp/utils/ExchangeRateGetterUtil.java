package com.example.expenseSplitterApp.utils;

import com.example.expenseSplitterApp.api.response.ExchangeRateResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component
public class ExchangeRateGetterUtil {
    @Value("${exchange-rate-getter.api.key}")
    private String apiKey;

    @Autowired
    private RestTemplate restTemplate;

    private static final String API_URL =
            "https://api.freecurrencyapi.com/v1/latest?apikey=API_KEY&base_currency=USD&currencies=CURRENCY_SYMBOL";

    private static final Map<String, String> countryCurrencyMap = new HashMap<>();

    static {
        countryCurrencyMap.put("Austria", "EUR"); // Euro
        countryCurrencyMap.put("Belgium", "EUR"); // Euro
        countryCurrencyMap.put("Cyprus", "EUR"); // Euro
        countryCurrencyMap.put("Estonia", "EUR"); // Euro
        countryCurrencyMap.put("Finland", "EUR"); // Euro
        countryCurrencyMap.put("France", "EUR"); // Euro
        countryCurrencyMap.put("Germany", "EUR"); // Euro
        countryCurrencyMap.put("Greece", "EUR"); // Euro
        countryCurrencyMap.put("Ireland", "EUR"); // Euro
        countryCurrencyMap.put("Italy", "EUR"); // Euro
        countryCurrencyMap.put("Latvia", "EUR"); // Euro
        countryCurrencyMap.put("Lithuania", "EUR"); // Euro
        countryCurrencyMap.put("Luxembourg", "EUR"); // Euro
        countryCurrencyMap.put("Malta", "EUR"); // Euro
        countryCurrencyMap.put("Netherlands", "EUR"); // Euro
        countryCurrencyMap.put("Portugal", "EUR"); // Euro
        countryCurrencyMap.put("Slovakia", "EUR"); // Euro
        countryCurrencyMap.put("Slovenia", "EUR"); // Euro
        countryCurrencyMap.put("Spain", "EUR"); // Euro

        // Rest of the countries with their respective currencies
        countryCurrencyMap.put("United States", "USD"); // US Dollar
        countryCurrencyMap.put("Japan", "JPY"); // Japanese Yen
        countryCurrencyMap.put("Bulgaria", "BGN"); // Bulgarian Lev
        countryCurrencyMap.put("Czech Republic", "CZK"); // Czech Republic Koruna
        countryCurrencyMap.put("Denmark", "DKK"); // Danish Krone
        countryCurrencyMap.put("United Kingdom", "GBP"); // British Pound Sterling
        countryCurrencyMap.put("Hungary", "HUF"); // Hungarian Forint
        countryCurrencyMap.put("Poland", "PLN"); // Polish Zloty
        countryCurrencyMap.put("Romania", "RON"); // Romanian Leu
        countryCurrencyMap.put("Sweden", "SEK"); // Swedish Krona
        countryCurrencyMap.put("Switzerland", "CHF"); // Swiss Franc
        countryCurrencyMap.put("Iceland", "ISK"); // Icelandic Krona
        countryCurrencyMap.put("Norway", "NOK"); // Norwegian Krone
        countryCurrencyMap.put("Croatia", "HRK"); // Croatian Kuna
        countryCurrencyMap.put("Russia", "RUB"); // Russian Ruble
        countryCurrencyMap.put("Turkey", "TRY"); // Turkish Lira
        countryCurrencyMap.put("Australia", "AUD"); // Australian Dollar
        countryCurrencyMap.put("Brazil", "BRL"); // Brazilian Real
        countryCurrencyMap.put("Canada", "CAD"); // Canadian Dollar
        countryCurrencyMap.put("China", "CNY"); // Chinese Yuan
        countryCurrencyMap.put("Hong Kong", "HKD"); // Hong Kong Dollar
        countryCurrencyMap.put("Indonesia", "IDR"); // Indonesian Rupiah
        countryCurrencyMap.put("Israel", "ILS"); // Israeli New Sheqel
        countryCurrencyMap.put("India", "INR"); // Indian Rupee
        countryCurrencyMap.put("South Korea", "KRW"); // South Korean Won
        countryCurrencyMap.put("Mexico", "MXN"); // Mexican Peso
        countryCurrencyMap.put("Malaysia", "MYR"); // Malaysian Ringgit
        countryCurrencyMap.put("New Zealand", "NZD"); // New Zealand Dollar
        countryCurrencyMap.put("Philippines", "PHP"); // Philippine Peso
        countryCurrencyMap.put("Singapore", "SGD"); // Singapore Dollar
        countryCurrencyMap.put("Thailand", "THB"); // Thai Baht
        countryCurrencyMap.put("South Africa", "ZAR"); // South African Rand
    }

    public String getCurrencySymbolByCountryName(String countryName){
        if(!countryCurrencyMap.get(countryName).equals("")){
            return countryCurrencyMap.get(countryName);
        }
        return "";
    }
    public double getExchangeRate (String countryName){
        String currencySymbol = countryCurrencyMap.getOrDefault(countryName, "USD");
        if(currencySymbol.equalsIgnoreCase("")){
            return 1.0;
        }
        String finalAPIURL = API_URL.replace("API_KEY",apiKey).replace("CURRENCY_SYMBOL",currencySymbol);

        ResponseEntity<ExchangeRateResponse> response = restTemplate.exchange(finalAPIURL, HttpMethod.GET,null, ExchangeRateResponse.class);

        ExchangeRateResponse responseBody = response.getBody();

        double exchangeRate = responseBody.getData().get(currencySymbol);

        return exchangeRate;
    }
}
