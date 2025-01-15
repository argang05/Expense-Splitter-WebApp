package com.example.expenseSplitterApp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EmployeeExpenseDetailDTOWithExchangeRate {
    private List<EmployeeFinalExpenseReportDTO> employeeFinalExpenseReportDTOList;
    private double exchangeRate;
}
