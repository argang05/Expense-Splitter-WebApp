package com.example.expenseSplitterApp.repositories;

import com.example.expenseSplitterApp.entity.TripEntity;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;

public class TripRepositoryImpl {
    @Autowired
    private MongoTemplate mongoTemplate;

    public List<TripEntity> getAllTripsWithinThreeMonths() {
        // Current date and time
        LocalDateTime now = LocalDateTime.now();

        // Calculate the start and end of the 3-month range
        LocalDateTime threeMonthsAgo = now.minus(3, ChronoUnit.MONTHS);
        LocalDateTime threeMonthsLater = now.plus(3, ChronoUnit.MONTHS);

        // Convert LocalDateTime to Date for MongoDB comparison
        Date startDate = Date.from(threeMonthsAgo.atZone(ZoneId.systemDefault()).toInstant());
        Date endDate = Date.from(threeMonthsLater.atZone(ZoneId.systemDefault()).toInstant());

        // Build the query to filter trips based on the ObjectId timestamp and sort by descending order
        Query query = new Query();
        query.addCriteria(Criteria.where("_id").gte(new ObjectId(startDate)).lte(new ObjectId(endDate)));
        query.with(Sort.by(Sort.Direction.DESC, "_id")); // Sort by _id in descending order

        // Execute the query
        return mongoTemplate.find(query, TripEntity.class);
    }

    public List<TripEntity> getAllTripsWithinThreeMonthsEmployeeSpecific(String empId) {
        // Current date and time
        LocalDateTime now = LocalDateTime.now();

        // Calculate the start and end of the 3-month range
        LocalDateTime threeMonthsAgo = now.minus(3, ChronoUnit.MONTHS);
        LocalDateTime threeMonthsLater = now.plus(3, ChronoUnit.MONTHS);

        // Convert LocalDateTime to Date for MongoDB comparison
        Date startDate = Date.from(threeMonthsAgo.atZone(ZoneId.systemDefault()).toInstant());
        Date endDate = Date.from(threeMonthsLater.atZone(ZoneId.systemDefault()).toInstant());

        // Build the query to filter trips based on the ObjectId timestamp and sort by descending order
        Query query = new Query();
        query.addCriteria(Criteria.where("_id").gte(new ObjectId(startDate)).lte(new ObjectId(endDate)));
        query.addCriteria(Criteria.where("groupMembersIds").is(empId));
        query.with(Sort.by(Sort.Direction.DESC, "_id")); // Sort by _id in descending order

        // Execute the query
        return mongoTemplate.find(query, TripEntity.class);
    }
}
