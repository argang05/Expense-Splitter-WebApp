package com.example.expenseSplitterApp.entity;

import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Document(collection = "bills")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BillsEntity {
    @Id
    private ObjectId id;
    private ObjectId tripId;
    private String billType;
    private String billUniqueId;
    @NonNull
    private Double billAmt;

    @NonNull
    private Boolean splitBill;
    @NonNull
    private Boolean splitEqually;
    private int numberOfContributors;
    private String billPayer;
    private Double perPersonShare;
    private List<String> contributorsIds;
    private Map<String,Double> contributerShare = new HashMap<>();
    private String imageUrl;
    private Date billDate;
}
