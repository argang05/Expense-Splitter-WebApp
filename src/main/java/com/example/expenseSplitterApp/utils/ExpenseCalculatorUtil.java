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
        perDiemRates.put("SM1", 40.0);
        perDiemRates.put("SM2", 40.0);
        perDiemRates.put("M0", 30.0);
        perDiemRates.put("M1", 30.0);
        perDiemRates.put("M2", 30.0);
        perDiemRates.put("M3", 30.0);
        perDiemRates.put("M4", 30.0);
        perDiemRates.put("M5", 30.0);
        perDiemRates.put("A0", 20.0);
        perDiemRates.put("A1", 20.0);
        perDiemRates.put("A2", 20.0);
        perDiemRates.put("A3", 20.0);
        perDiemRates.put("A4", 20.0);
        perDiemRates.put("A5", 20.0);
        perDiemRates.put("A6", 20.0);
        perDiemRates.put("A7", 20.0);
        perDiemRates.put("A8", 20.0);
        perDiemRates.put("A9", 20.0);

        // Initialize bill limits
        billLimits.put("SM1", 80.0);
        billLimits.put("SM2", 80.0);
        billLimits.put("M0", 60.0);
        billLimits.put("M1", 60.0);
        billLimits.put("M2", 60.0);
        billLimits.put("M3", 60.0);
        billLimits.put("M4", 60.0);
        billLimits.put("M5", 60.0);
        billLimits.put("A0", 40.0);
        billLimits.put("A1", 40.0);
        billLimits.put("A2", 40.0);
        billLimits.put("A3", 40.0);
        billLimits.put("A4", 40.0);
        billLimits.put("A5", 40.0);
        billLimits.put("A6", 40.0);
        billLimits.put("A7", 40.0);
        billLimits.put("A8", 40.0);
        billLimits.put("A9", 40.0);
    }

    public void getExchangeRate(TripEntity trip){
        exchangeRate = trip.getExchangeRate();
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
