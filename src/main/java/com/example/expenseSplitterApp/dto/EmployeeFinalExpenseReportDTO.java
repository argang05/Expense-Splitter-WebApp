package com.example.expenseSplitterApp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EmployeeFinalExpenseReportDTO {
    private String empId;
    private String empName;
    private String email;
    private String empTier;
    private Double totalFoodBill;
    private double perDiemTotal;
    private double totalNonFoodBill;
    private double billableLimitTotal;
    private double remainingBalanceTotal;
    private String currencySymbol;
    private Map<String,Map<String,Double>> dues = new HashMap<>();
}
