package com.example.expenseSplitterApp.repositories;

import com.example.expenseSplitterApp.entity.TripEntity;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TripRepository extends MongoRepository<TripEntity, ObjectId> {
}
