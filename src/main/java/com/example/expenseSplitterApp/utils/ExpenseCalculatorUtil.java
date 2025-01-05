package com.example.expenseSplitterApp.utils;

import com.example.expenseSplitterApp.entity.TripEntity;
import com.example.expenseSplitterApp.services.EmployeeService;
import com.example.expenseSplitterApp.services.TripService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class ExpenseCalculatorUtil {
    private static final Map<String, Double> perDiemRates = new HashMap<>();
    private static final Map<String, Double> billLimits = new HashMap<>();
    private static double exchangeRate;

    @Autowired
    private TripService tripService;

    static {
        // Initialize per diem rates
        perDiemRates.put("SM1-SM2", 40.0);
        perDiemRates.put("M0-M5", 30.0);
        perDiemRates.put("A0-A9", 20.0);

        // Initialize bill limits
        billLimits.put("SM1-SM2", 80.0);
        billLimits.put("M0-M5", 60.0);
        billLimits.put("A0-A9", 40.0);

    }

    public void getExchangeRate(TripEntity trip){
        exchangeRate = trip.getExhangeRate();
    }

    public double calculatePerDiem(String tier, int days, TripEntity trip) {
        getExchangeRate(trip);
        double perDiemDayWiseRateUSD = perDiemRates.getOrDefault(tier, 0.0);
        double perDiemDayWiseRateCurrency = perDiemDayWiseRateUSD * exchangeRate;
        return perDiemDayWiseRateCurrency * days;
    }

    public double calculateBillableLimit(String tier, int days) {
        double billLimitsUSD = billLimits.getOrDefault(tier, 0.0);
        double billLimitsCurrency = billLimitsUSD * exchangeRate;
        return billLimitsCurrency * days;
    }

    public double calculateRemainingBalance(String tier, int days, double totalFoodBill) {
        double billableLimit = calculateBillableLimit(tier, days);
        return billableLimit - totalFoodBill;
    }

}
