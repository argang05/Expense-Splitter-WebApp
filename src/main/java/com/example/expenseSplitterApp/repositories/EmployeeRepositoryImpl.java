package com.example.expenseSplitterApp.repositories;

import com.example.expenseSplitterApp.entity.EmployeeEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import java.util.List;

public class EmployeeRepositoryImpl {
    @Autowired
    private MongoTemplate mongoTemplate;

    public List<String> getAllEmailIdsOfEmployees(List<String> empIds) {
        // Create a query to filter employees by empId
        Query query = new Query();
        query.addCriteria(Criteria.where("empId").in(empIds));

        // Include only the email field in the result and exclude _id
        query.fields().include("email").exclude("_id");

        // Execute the query and map the result to a list of email strings
        return mongoTemplate.find(query, EmployeeEntity.class)
                .stream()
                .map(EmployeeEntity::getEmail) // Extract the email property
                .toList();
    }

    public String getEmployeeEmail(String empId) {
        // Create a query to filter employees by empId
        Query query = new Query();
        query.addCriteria(Criteria.where("empId").is(empId));

        // Include only the email field in the result and exclude _id
        query.fields().include("email").exclude("_id");

        // Execute the query and map the result to a single EmployeeEntity
        EmployeeEntity employee = mongoTemplate.findOne(query, EmployeeEntity.class);

        // Return the email if the employee exists, otherwise return null or handle appropriately
        return employee != null ? employee.getEmail() : null;
    }

    public String getEmployeeNameById(String empId) {
        Query query = new Query(Criteria.where("empId").is(empId));
        query.fields().include("empName").exclude("_id"); // Fetch only the empName field
        EmployeeEntity employee = mongoTemplate.findOne(query, EmployeeEntity.class);
        return employee != null ? employee.getEmpName() : "Unknown";
    }


}
