package com.example.expenseSplitterApp.controllers;

import com.example.expenseSplitterApp.entity.BillsEntity;
import com.example.expenseSplitterApp.repositories.BillRepository;
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

    @Autowired
    private BillRepository billRepository;

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

    @GetMapping("non-food/tripId/{id}")
    public ResponseEntity<?> getNonFoodBillsByTripId(@PathVariable String id){
        try{
            ObjectId tripId = new ObjectId(id);
            List<BillsEntity> foodBills = billService.getNonFoodBillsByTripId(tripId);
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

            if(!(bill.getBillType().equalsIgnoreCase("Food"))){
                billService.createNonFoodBill(bill,tripId);
            }else{
                if(bill.getSplitBill()){
                    if(bill.getSplitEqually()){
                        billService.createBillSplitEqual(bill, tripId);
                    }else{
                        billService.createBillSplitUnequal(bill, tripId);
                    }
                }else{
                    billService.createBillNoSplit(bill,tripId);
                }
            }
//            billService.sendBillCreationNotification(bill);
            return new ResponseEntity<>(bill, HttpStatus.CREATED);
        } catch (Exception e) {
            log.error("Unexpected Error While Creating Bill: ", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/delete/billId/{bId}/tripId/{tId}")
    public ResponseEntity<?> deleteBill(@PathVariable String bId, @PathVariable String tId){
        ObjectId billId = new ObjectId(bId);
        ObjectId tripId = new ObjectId(tId);
        BillsEntity bill = billRepository.findById(billId).orElse(null);
        if(bill != null){
            if(!(bill.getBillType().equalsIgnoreCase("Food"))){
                boolean isDeleted = billService.deleteNonFoodBill(billId,tripId);
                if(isDeleted){
                    return new ResponseEntity<>("Bill Deleted",HttpStatus.OK);
                }else{
                    return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }else{
                if(bill.getSplitBill()){
                    if(bill.getSplitEqually()){
                        boolean isDeleted = billService.deleteBillEqualSplit(billId,tripId);
                        if(isDeleted){
                            return new ResponseEntity<>("Bill Deleted",HttpStatus.OK);
                        }else{
                            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
                        }
                    }else{
                        boolean isDeleted = billService.deleteBillSplitUnequal(billId,tripId);
                        if(isDeleted){
                            return new ResponseEntity<>("Bill Deleted",HttpStatus.OK);
                        }else{
                            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
                        }
                    }
                }else{
                    boolean isDeleted = billService.deleteBillNoSplit(billId,tripId);
                    if(isDeleted){
                        return new ResponseEntity<>("Bill Deleted",HttpStatus.OK);
                    }else{
                        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
                    }
                }
            }
        }
        return null;
    }

    @PutMapping(value = "/update-bill/billId/{bId}/tripId/{tId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateBill(
            @PathVariable String bId,
            @PathVariable String tId,
            @RequestPart("bill") String billJson,  // or use a specific DTO class
            @RequestPart(value = "image", required = false) MultipartFile image
    ) throws JsonProcessingException {
        // Parse the JSON if it's a String (for example)
        ObjectMapper objectMapper = new ObjectMapper();
        BillsEntity updatedBill = objectMapper.readValue(billJson, BillsEntity.class);
        try{
            ObjectId billId = new ObjectId(bId);
            ObjectId tripId = new ObjectId(tId);

            // If an image is uploaded, handle it in the service
            if (image != null && !image.isEmpty()) {
                String imageUrl = billService.uploadImageToCloudinary(image);
                updatedBill.setImageUrl(imageUrl); // Set the image URL in the bill
            }else{
                BillsEntity bill = billRepository.findById(billId).orElse(null);
                if(bill != null){
                    updatedBill.setImageUrl(bill.getImageUrl());
                }
            }

            BillsEntity responseBill = billService.updateBill(updatedBill , billId, tripId);
            return new ResponseEntity<>(responseBill , HttpStatus.CREATED);
        } catch (Exception e) {
            log.error("Unexpected Error While Updating Bill: ", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/food-bill-image-url/{tId}")
    public ResponseEntity<?> getFoodBillsImageUrls(@PathVariable String tId){
        try{
            ObjectId tripId = new ObjectId(tId);
            List<String> foodBillImgUrls = billService.getAllFoodBillImageUrls(tripId);
            if(foodBillImgUrls != null && !foodBillImgUrls.isEmpty()){
                return new ResponseEntity<>(foodBillImgUrls,HttpStatus.OK);
            }else{
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        }catch (Exception e){
            log.error("Unexpected Error While Fetching Food Bill URLs: ", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/non-food-bill-image-url/{tId}")
    public ResponseEntity<?> getNonFoodBillsImageUrls(@PathVariable String tId){
        try{
            ObjectId tripId = new ObjectId(tId);
            List<String> nonFoodBillImgUrls = billService.getAllNonFoodBillsImageUrls(tripId);
            if(nonFoodBillImgUrls != null && !nonFoodBillImgUrls.isEmpty()){
                return new ResponseEntity<>(nonFoodBillImgUrls,HttpStatus.OK);
            }else{
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        }catch (Exception e){
            log.error("Unexpected Error While Fetching Non-Food Bill URLs: ", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
