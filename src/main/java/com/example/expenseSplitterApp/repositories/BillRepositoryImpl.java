package com.example.expenseSplitterApp.repositories;

import com.example.expenseSplitterApp.entity.BillsEntity;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;


import java.util.List;
import java.util.stream.Collectors;

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

    public List<BillsEntity> getNonFoodBillsByTripId(ObjectId tripId){
        Query query = new Query();

        query.addCriteria(Criteria.where("billType").ne("food"));
        query.addCriteria(Criteria.where("tripId").is(tripId));

        List<BillsEntity> nonFoodBills = mongoTemplate.find(query, BillsEntity.class);

        return nonFoodBills;
    }

    // Function to fetch imageUrls of all food bills for a specific tripId
    public List<String> getImageUrlsOfFoodBillsByTripId(ObjectId tripId) {
        Query query = new Query();
        query.addCriteria(Criteria.where("billType").is("food").and("tripId").is(tripId));
        query.fields().include("imageUrl").exclude("_id");

        // Fetch matching bills and map to imageUrls
        return mongoTemplate.find(query, BillsEntity.class).stream()
                .map(BillsEntity::getImageUrl)
                .collect(Collectors.toList());
    }

    // Function to fetch imageUrls of all non-food bills for a specific tripId
    public List<String> getImageUrlsOfNonFoodBillsByTripId(ObjectId tripId) {
        Query query = new Query();
        query.addCriteria(Criteria.where("billType").ne("food").and("tripId").is(tripId));
        query.fields().include("imageUrl").exclude("_id");

        // Fetch matching bills and map to imageUrls
        return mongoTemplate.find(query, BillsEntity.class).stream()
                .map(BillsEntity::getImageUrl)
                .collect(Collectors.toList());
    }
}
