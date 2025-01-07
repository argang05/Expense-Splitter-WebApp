package com.example.expenseSplitterApp.controllers;

import com.example.expenseSplitterApp.entity.BillsEntity;
import com.example.expenseSplitterApp.services.BillService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
@Slf4j
public class BillController {

    @Autowired
    private BillService billService;

    @GetMapping("/tripId/{id}")
    public ResponseEntity<?> getFoodBillsByTripId(@PathVariable String id){
        try{
            ObjectId tripId = new ObjectId(id);
            List<BillsEntity> foodBills = billService.getFoodBillsByTripId(tripId);
            if(foodBills != null && !foodBills.isEmpty()){
                return new ResponseEntity<>(foodBills, HttpStatus.OK);
            }else{
                return new ResponseEntity<>("No Bills Found!",HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            log.error("Unexpected Error While Getting Bills by tripid: ",e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/empId/{empId}")
    public ResponseEntity<?> getFoodBillsByEmpId(@PathVariable String empId){
        try{
            List<BillsEntity> foodBills = billService.getFoodBillsByEmpId(empId);
            if(foodBills != null && !foodBills.isEmpty()){
                return new ResponseEntity<>(foodBills, HttpStatus.OK);
            }else{
                return new ResponseEntity<>("No Bills Found!",HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            log.error("Unexpected Error While Getting Bills by empid: ",e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @PostMapping(value = "/create-bill/tripId/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createBill(
            @PathVariable String id,
            @RequestPart("bill") String billJson,  // or use a specific DTO class
            @RequestPart(value = "image", required = false) MultipartFile image
    ) throws JsonProcessingException {
        // Parse the JSON if it's a String (for example)
        ObjectMapper objectMapper = new ObjectMapper();
        BillsEntity bill = objectMapper.readValue(billJson, BillsEntity.class);
        try {
            ObjectId tripId = new ObjectId(id);

            // If an image is uploaded, handle it in the service
            if (image != null && !image.isEmpty()) {
                String imageUrl = billService.uploadImageToCloudinary(image);
                bill.setImageUrl(imageUrl); // Set the image URL in the bill
            }

            if(bill.getSplitEqually() == true){
                billService.createBillSplitEqual(bill, tripId);
            }else{
                billService.createBillSplitUnequal(bill, tripId);
            }

            return new ResponseEntity<>(bill, HttpStatus.CREATED);
        } catch (Exception e) {
            log.error("Unexpected Error While Creating Bill: ", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
