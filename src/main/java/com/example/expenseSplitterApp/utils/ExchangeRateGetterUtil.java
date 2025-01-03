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
           // Major countries with widely used currencies
           countryCurrencyMap.put("United States", "USD"); // US Dollar
           countryCurrencyMap.put("Eurozone", "EUR"); // Euro
           countryCurrencyMap.put("United Kingdom", "GBP"); // British Pound
           countryCurrencyMap.put("Japan", "JPY"); // Japanese Yen
           countryCurrencyMap.put("India", "INR"); // Indian Rupee
           countryCurrencyMap.put("Canada", "CAD"); // Canadian Dollar
           countryCurrencyMap.put("Australia", "AUD"); // Australian Dollar
           countryCurrencyMap.put("China", "CNY"); // Chinese Yuan
           countryCurrencyMap.put("Switzerland", "CHF"); // Swiss Franc
           countryCurrencyMap.put("South Korea", "KRW"); // South Korean Won
           countryCurrencyMap.put("Russia", "RUB"); // Russian Ruble
           countryCurrencyMap.put("Brazil", "BRL"); // Brazilian Real
           countryCurrencyMap.put("South Africa", "ZAR"); // South African Rand
           countryCurrencyMap.put("Mexico", "MXN"); // Mexican Peso
           countryCurrencyMap.put("Turkey", "TRY"); // Turkish Lira
           countryCurrencyMap.put("Saudi Arabia", "SAR"); // Saudi Riyal
           countryCurrencyMap.put("United Arab Emirates", "AED"); // UAE Dirham
           countryCurrencyMap.put("Singapore", "SGD"); // Singapore Dollar
           countryCurrencyMap.put("Hong Kong", "HKD"); // Hong Kong Dollar
           countryCurrencyMap.put("New Zealand", "NZD"); // New Zealand Dollar
           countryCurrencyMap.put("Norway", "NOK"); // Norwegian Krone
           countryCurrencyMap.put("Sweden", "SEK"); // Swedish Krona
           countryCurrencyMap.put("Denmark", "DKK"); // Danish Krone
           countryCurrencyMap.put("Thailand", "THB"); // Thai Baht
           countryCurrencyMap.put("Malaysia", "MYR"); // Malaysian Ringgit
           countryCurrencyMap.put("Indonesia", "IDR"); // Indonesian Rupiah
           countryCurrencyMap.put("Vietnam", "VND"); // Vietnamese Dong
           countryCurrencyMap.put("Philippines", "PHP"); // Philippine Peso
           countryCurrencyMap.put("Pakistan", "PKR"); // Pakistani Rupee
           countryCurrencyMap.put("Bangladesh", "BDT"); // Bangladeshi Taka
           countryCurrencyMap.put("Egypt", "EGP"); // Egyptian Pound
           countryCurrencyMap.put("Argentina", "ARS"); // Argentine Peso
           countryCurrencyMap.put("Chile", "CLP"); // Chilean Peso
           countryCurrencyMap.put("Colombia", "COP"); // Colombian Peso
           countryCurrencyMap.put("Nigeria", "NGN"); // Nigerian Naira
           countryCurrencyMap.put("Kenya", "KES"); // Kenyan Shilling
           countryCurrencyMap.put("Ghana", "GHS"); // Ghanaian Cedi
           countryCurrencyMap.put("Israel", "ILS"); // Israeli New Shekel
           countryCurrencyMap.put("Czech Republic", "CZK"); // Czech Koruna
           countryCurrencyMap.put("Poland", "PLN"); // Polish Zloty
           countryCurrencyMap.put("Hungary", "HUF"); // Hungarian Forint
           countryCurrencyMap.put("Romania", "RON"); // Romanian Leu
           countryCurrencyMap.put("Ukraine", "UAH"); // Ukrainian Hryvnia
           countryCurrencyMap.put("Kazakhstan", "KZT"); // Kazakhstani Tenge
           countryCurrencyMap.put("Iraq", "IQD"); // Iraqi Dinar
           countryCurrencyMap.put("Iran", "IRR"); // Iranian Rial
           countryCurrencyMap.put("Qatar", "QAR"); // Qatari Riyal
           countryCurrencyMap.put("Kuwait", "KWD"); // Kuwaiti Dinar
           countryCurrencyMap.put("Bahrain", "BHD"); // Bahraini Dinar
           countryCurrencyMap.put("Oman", "OMR"); // Omani Rial

           // Small but globally recognized currencies
           countryCurrencyMap.put("Iceland", "ISK"); // Icelandic Krona
           countryCurrencyMap.put("Georgia", "GEL"); // Georgian Lari
           countryCurrencyMap.put("Azerbaijan", "AZN"); // Azerbaijani Manat
           countryCurrencyMap.put("Armenia", "AMD"); // Armenian Dram
           countryCurrencyMap.put("Uzbekistan", "UZS"); // Uzbekistani Som
           countryCurrencyMap.put("Turkmenistan", "TMT"); // Turkmenistani Manat
           countryCurrencyMap.put("Kyrgyzstan", "KGS"); // Kyrgyzstani Som
           countryCurrencyMap.put("Sri Lanka", "LKR"); // Sri Lankan Rupee
           countryCurrencyMap.put("Nepal", "NPR"); // Nepalese Rupee
           countryCurrencyMap.put("Bhutan", "BTN"); // Bhutanese Ngultrum
           countryCurrencyMap.put("Afghanistan", "AFN"); // Afghan Afghani
           countryCurrencyMap.put("Zimbabwe", "ZWL"); // Zimbabwean Dollar
           countryCurrencyMap.put("Myanmar", "MMK"); // Burmese Kyat
           countryCurrencyMap.put("Cambodia", "KHR"); // Cambodian Riel
    }
    public String getCurrencySymbolByCountryName(String countryName){
        if(!countryCurrencyMap.get(countryName).equals("")){
            return countryCurrencyMap.get(countryName);
        }
        return "";
    }
    public double getExchangeRate (String countryName){
        String currencySymbol = countryCurrencyMap.getOrDefault(countryName, "USD");
        String finalAPIURL = API_URL.replace("API_KEY",apiKey).replace("CURRENCY_SYMBOL",currencySymbol);

        ResponseEntity<ExchangeRateResponse> response = restTemplate.exchange(finalAPIURL, HttpMethod.GET,null, ExchangeRateResponse.class);

        ExchangeRateResponse responseBody = response.getBody();

        double exchangeRate = responseBody.getData().get(currencySymbol);

        return exchangeRate;
    }
}
