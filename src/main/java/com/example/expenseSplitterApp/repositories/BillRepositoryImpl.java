package com.example.expenseSplitterApp.repositories;

import com.example.expenseSplitterApp.entity.BillsEntity;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;


import java.util.List;

public class BillRepositoryImpl {
    @Autowired
    private MongoTemplate mongoTemplate;

    public List<BillsEntity> getFoodBillsByTripId(ObjectId tripId){
        Query query = new Query();

        query.addCriteria(Criteria.where("billType").is("food"));
        query.addCriteria(Criteria.where("tripId").is(tripId));

        List<BillsEntity> foodBills = mongoTemplate.find(query, BillsEntity.class);

        return foodBills;
    }

    public List<BillsEntity> getFoodBillsByEmployeeId(String empId){
        Query query = new Query();

        query.addCriteria(Criteria.where("billType").is("food"));
        query.addCriteria(Criteria.where("contributorsIds").is(empId));

        List<BillsEntity> foodBills = mongoTemplate.find(query, BillsEntity.class);

        return foodBills;
    }


}
