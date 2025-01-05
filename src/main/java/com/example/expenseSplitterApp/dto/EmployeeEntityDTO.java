package com.example.expenseSplitterApp.dto;

import com.example.expenseSplitterApp.entity.BillsEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EmployeeEntityDTO {
    private String empId;
    private String empName;
    private String email;
    private String empTier;
    private Double totalFoodBill;
    private List<BillsEntity> bills = new ArrayList<>();
    private Map<String,Map<String,Double>> dues = new HashMap<>();
}
