package com.example.expenseSplitterApp.repositories;

import com.example.expenseSplitterApp.entity.BillsEntity;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BillRepository extends MongoRepository<BillsEntity, ObjectId> {
}
