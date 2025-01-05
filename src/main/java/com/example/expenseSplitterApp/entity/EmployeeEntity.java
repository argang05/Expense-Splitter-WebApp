package com.example.expenseSplitterApp.entity;


import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Document(collection = "employees")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class EmployeeEntity {
    //Indexing Does not happen through this command for this we have to write a config command in application.properties:
    @Id
    @NonNull
    private String empId; //Making EmpID Unique and Not Null

    @NonNull
    private String empName;

    @NonNull
    private String password;

    @NonNull
    private String email;

    @NonNull
    private String empTier;

    @DBRef
    private List<BillsEntity> bills = new ArrayList<>();
}
