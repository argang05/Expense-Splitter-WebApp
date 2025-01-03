package com.example.expenseSplitterApp.services;

import com.example.expenseSplitterApp.dto.EmployeeEntityDTO;
import com.example.expenseSplitterApp.entity.EmployeeEntity;
import com.example.expenseSplitterApp.repositories.EmployeeRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@Slf4j
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    private static final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public static String hashPassword(String plainPassword){
        return encoder.encode(plainPassword);
    }

    public boolean matchPassword(String plainPassword, String hashedPassword){
        return encoder.matches(plainPassword,hashedPassword);
    }


    public void saveEmployee(EmployeeEntity employeeEntity){
        try{
            if (employeeEntity.getEmpId().isEmpty()) {
                throw new IllegalArgumentException("EmpId cannot be null or empty.");
            }
            employeeEntity.setPassword(hashPassword(employeeEntity.getPassword()));
            employeeRepository.save(employeeEntity);
        }catch(Exception e){
            //We're going to use LogBack Package To Log Any Errors Occurred Here;
//            logger.error("An Unexpected Error Occurred While Saving The User named {}: ",user.getUserName(),e);
            log.error("An Unexpected Error Occurred While Saving The User named {}: ",employeeEntity.getEmpId(),e);
        }
    }

    public EmployeeEntity getEmployeeByEmpId(String empId){
        return employeeRepository.findByEmpId(empId);
    }

    public List<EmployeeEntity> getAllEmployees(){
        return employeeRepository.findAll();


    }

    public List<EmployeeEntity> getAllWithEmpIds(List<String> empIds){
        return employeeRepository.findByEmpIdIn(empIds);
    }



}
