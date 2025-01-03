package com.example.expenseSplitterApp.repositories;

import com.example.expenseSplitterApp.entity.EmployeeEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface EmployeeRepository extends MongoRepository<EmployeeEntity , String> {
    EmployeeEntity findByEmpId(String empId);

    // Find all employees with empId in the provided list of empIds
    List<EmployeeEntity> findByEmpIdIn(List<String> empIds);
}
