package com.example.expenseSplitterApp.dto;

import com.example.expenseSplitterApp.entity.BillsEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EmployeeDTOWithPassword {
    private String empId;
    private String empName;
    private String password;
    private String email;
    private String empTier;
}
