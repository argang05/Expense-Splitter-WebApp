package com.example.expenseSplitterApp.entity;

import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "trips")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TripEntity {
    @Id
    private ObjectId id;
    @NonNull
    private String tripName;
    private String tripType;
    private String tripPurpose;
    @NonNull
    private Boolean isInternational;
    private String continent;
    @NonNull
    private String country;
    @NonNull
    private int numberOfDays;
    private int groupStrength;
    @NonNull
    private List<String> groupMembersIds;

    private Double exhangeRate;

    private String currencySymbol;

    @DBRef
    private List<BillsEntity> bills = new ArrayList<>();
}
