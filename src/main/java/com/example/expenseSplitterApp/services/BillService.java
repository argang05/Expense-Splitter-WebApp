package com.example.expenseSplitterApp.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.expenseSplitterApp.config.CloudinaryConfig;
import com.example.expenseSplitterApp.entity.BillsEntity;
import com.example.expenseSplitterApp.entity.EmployeeEntity;
import com.example.expenseSplitterApp.entity.TripEntity;
import com.example.expenseSplitterApp.repositories.*;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BillService {

    private final Cloudinary cloudinary;

    @Autowired
    public BillService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    @Autowired
    private BillRepositoryImpl billRepositoryImpl;

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private TripService tripService;

    @Autowired
    private ImageCompressionService imageCompressionService;

    @Autowired
    private EmployeeRepositoryImpl employeeRepositoryImpl;

    @Autowired
    private EmailService emailService;

    public static <T> List<T> slice(List<T> list) {
        if (list == null || list.size() <= 1) {
            return list; // Handle empty list or list with only one element
        }
        return list.subList(1, list.size());
    }

    public List<BillsEntity> getFoodBillsByTripId(ObjectId tripId){
        return billRepositoryImpl.getFoodBillsByTripId(tripId);
    }

    public List<BillsEntity> getNonFoodBillsByTripId(ObjectId tripId){
        return billRepositoryImpl.getNonFoodBillsByTripId(tripId);
    }

    public void sendBillCreationNotification(BillsEntity bill){
        if(bill.getContributorsIds().isEmpty()){
            String billPayerEmailId = employeeRepositoryImpl.getEmployeeEmail(bill.getBillPayer());
            String to = billPayerEmailId;
            List<String> cc = new ArrayList<>();
            emailService.sendNewBillNotificationEmail(to,cc,bill);
        }else{
            List<String> contributorEmailIds = employeeRepositoryImpl.getAllEmailIdsOfEmployees(bill.getContributorsIds());
            String to = contributorEmailIds.get(0);
            List<String> cc = slice(contributorEmailIds);
            emailService.sendNewBillNotificationEmail(to,cc,bill);
        }
    }


    public String uploadImageToCloudinary(MultipartFile image) {
        try {
            // Use Cloudinary SDK to upload the image and return the URL
            Map<?, ?> uploadResult = cloudinary.uploader().upload(image.getBytes(), ObjectUtils.emptyMap());
            return (String) uploadResult.get("secure_url"); // Return the secure URL of the image
        } catch (Exception e) {
            throw new RuntimeException("Error uploading image to Cloudinary", e);
        }
    }

    public List<String> getAllFoodBillImageUrls(ObjectId tripId){
        return billRepositoryImpl.getImageUrlsOfFoodBillsByTripId(tripId);
    }

    public List<String> getAllNonFoodBillsImageUrls(ObjectId tripId){
        return billRepositoryImpl.getImageUrlsOfNonFoodBillsByTripId(tripId);
    }



    public BillsEntity createBillSplitEqual(BillsEntity bill, ObjectId tripId) {
        bill.setTripId(tripId);
        bill.setNumberOfContributors(bill.getContributorsIds().toArray().length);
        TripEntity trip = tripService.getTripById(bill.getTripId());

        if (bill.getSplitBill()) {
            // Calculate per person share
            Double perShareCost = Math.round(bill.getBillAmt() / bill.getNumberOfContributors() * 100.0) / 100.0;
            bill.setPerPersonShare(perShareCost);

            if (bill.getContributorsIds() != null && !bill.getContributorsIds().isEmpty()) {
                // Create contributor share map
                Map<String, Double> contributorShareMap = new HashMap<>();
                for (String contributorId : bill.getContributorsIds()) {
                    contributorShareMap.put(contributorId, perShareCost);
                }
                bill.setContributerShare(contributorShareMap);

                // Fetch all employees with matching empIds
                List<EmployeeEntity> contributors = employeeRepository.findByEmpIdIn(bill.getContributorsIds());
                billRepository.save(bill);

                // Update each contributor's bills and dues
                for (EmployeeEntity employee : contributors) {
                    if (employee.getBills() == null) {
                        employee.setBills(new ArrayList<>());
                    }
                    employee.getBills().add(bill);

                    if (trip != null) {
                        // Update food bills
                        Map<String, Double> totalFoodBills = trip.getTotalFoodBill();
                        if (totalFoodBills == null) {
                            totalFoodBills = new HashMap<>();
                        }
                        totalFoodBills.put(employee.getEmpId(),
                                totalFoodBills.getOrDefault(employee.getEmpId(), 0.0) + perShareCost);
                        trip.setTotalFoodBill(totalFoodBills);

                        // Handle dues logic
                        if (!bill.getBillPayer().equalsIgnoreCase(employee.getEmpId())) {
                            Map<String, Map<String, Double>> dues = trip.getDues();
                            if (dues == null) {
                                dues = new HashMap<>();
                            }

                            Map<String, Double> dueRecord = dues.getOrDefault(employee.getEmpId(), new HashMap<>());
                            double existingDue = dueRecord.getOrDefault(bill.getBillPayer(), 0.0);

                            // Add the new due amount
                            double newDue = existingDue + perShareCost;

                            // Handle due balancing logic
                            Map<String, Double> billPayerDueRecord = dues.getOrDefault(bill.getBillPayer(), new HashMap<>());
                            double reverseDue = billPayerDueRecord.getOrDefault(employee.getEmpId(), 0.0);

                            if (reverseDue > 0) {
                                if (newDue > reverseDue) {
                                    // Bill payer owes more to the current employee
                                    newDue -= reverseDue;
                                    billPayerDueRecord.remove(employee.getEmpId());
                                    dueRecord.put(bill.getBillPayer(), newDue);
                                } else if (newDue < reverseDue) {
                                    // Current employee owes less to the bill payer
                                    reverseDue -= newDue;
                                    billPayerDueRecord.put(employee.getEmpId(), reverseDue);
                                    dueRecord.remove(bill.getBillPayer());
                                } else {
                                    // Balances out completely
                                    billPayerDueRecord.remove(employee.getEmpId());
                                    dueRecord.remove(bill.getBillPayer());
                                }
                            } else {
                                // No reverse due; simply add/update the due record
                                dueRecord.put(bill.getBillPayer(), newDue);
                            }

                            dues.put(employee.getEmpId(), dueRecord);
                            dues.put(bill.getBillPayer(), billPayerDueRecord);
                            trip.setDues(dues);
                            tripRepository.save(trip);
                        }
                    }

                    employeeRepository.save(employee); // Save updated employee
                }
            }
        }

        // Add the bill to the trip
        if (trip != null && bill != null) {
            trip.getBills().add(bill);
            tripRepository.save(trip);
            billRepository.save(bill);
        }

        return bill;
    }


    public BillsEntity createBillSplitUnequal(BillsEntity bill, ObjectId tripId) {
        bill.setTripId(tripId);
        bill.setNumberOfContributors(bill.getContributorsIds().toArray().length);
        TripEntity trip = tripService.getTripById(bill.getTripId());

        if (bill.getSplitBill()) {
            bill.setPerPersonShare(0.0);

            if (bill.getContributorsIds() != null && !bill.getContributorsIds().isEmpty()) {
                // Fetch contributors
                List<EmployeeEntity> contributors = employeeRepository.findByEmpIdIn(bill.getContributorsIds());
                billRepository.save(bill);

                for (EmployeeEntity employee : contributors) {
                    if (employee.getBills() == null) {
                        employee.setBills(new ArrayList<>());
                    }
                    employee.getBills().add(bill);

                    if (trip != null) {
                        // Update total food bills
                        Map<String, Double> totalFoodBills = trip.getTotalFoodBill();
                        if (totalFoodBills == null) {
                            totalFoodBills = new HashMap<>();
                        }

                        totalFoodBills.put(
                                employee.getEmpId(),
                                totalFoodBills.getOrDefault(employee.getEmpId(), 0.0)
                                        + bill.getContributerShare().getOrDefault(employee.getEmpId(), 0.0)
                        );
                        trip.setTotalFoodBill(totalFoodBills);
                        tripRepository.save(trip);
                    }

                    if (!bill.getBillPayer().equalsIgnoreCase(employee.getEmpId())) {
                        if (trip != null) {
                            // Retrieve existing dues map or initialize it
                            Map<String, Map<String, Double>> dues = trip.getDues();
                            if (dues == null) {
                                dues = new HashMap<>();
                            }

                            // Calculate current due
                            double currentDue = bill.getContributerShare().getOrDefault(employee.getEmpId(), 0.0);

                            // Balance dues between bill payer and contributor
                            String payerId = bill.getBillPayer();
                            String contributorId = employee.getEmpId();

                            Map<String, Double> payerDues = dues.getOrDefault(payerId, new HashMap<>());
                            Map<String, Double> contributorDues = dues.getOrDefault(contributorId, new HashMap<>());

                            // Check if there are existing dues between payer and contributor
                            double existingDueFromContributor = contributorDues.getOrDefault(payerId, 0.0);
                            double existingDueFromPayer = payerDues.getOrDefault(contributorId, 0.0);

                            if (existingDueFromPayer > 0) {
                                // Payer already owes contributor, adjust the balance
                                if (existingDueFromPayer > currentDue) {
                                    payerDues.put(contributorId, existingDueFromPayer - currentDue);
                                    currentDue = 0;
                                } else {
                                    currentDue -= existingDueFromPayer;
                                    payerDues.remove(contributorId);
                                }
                            }

                            if (currentDue > 0) {
                                // Contributor owes the remaining amount to the payer
                                contributorDues.put(payerId, existingDueFromContributor + currentDue);
                            }

                            // Update the dues map
                            if (!payerDues.isEmpty()) {
                                dues.put(payerId, payerDues);
                            } else {
                                dues.remove(payerId);
                            }

                            if (!contributorDues.isEmpty()) {
                                dues.put(contributorId, contributorDues);
                            } else {
                                dues.remove(contributorId);
                            }

                            trip.setDues(dues);
                            tripRepository.save(trip);
                        }
                    }

                    employeeRepository.save(employee); // Save updated employee
                }
            }
        }

        if (trip != null && bill != null) {
            trip.getBills().add(bill);
            tripRepository.save(trip);
        }

        return bill;
    }


    public BillsEntity createBillNoSplit(BillsEntity bill,ObjectId tripId){
        bill.setTripId(tripId);
        // Save the bill first to generate an ID
        billRepository.save(bill);
        TripEntity trip = tripService.getTripById(bill.getTripId());
        EmployeeEntity employee = employeeRepository.findByEmpId(bill.getBillPayer());
        if(trip != null){
            // Get the existing food bill map or create a new one if it doesn't exist
            Map<String, Double> totalFoodBills = trip.getTotalFoodBill();
            if (totalFoodBills == null) {
                totalFoodBills = new HashMap<>();
            }

            // Update the food bill for the specific employee
            totalFoodBills.put(bill.getBillPayer(), totalFoodBills.getOrDefault(bill.getBillPayer(), 0.0) + Double.parseDouble(String.valueOf(bill.getBillAmt())));

            // Set the updated food bill map
            trip.setTotalFoodBill(totalFoodBills);

            trip.getBills().add(bill);

            // Save the updated trip entity
            tripRepository.save(trip);
        }
        if(employee != null){
            if (employee.getBills() == null) {
                employee.setBills(new ArrayList<>());
            }
            employee.getBills().add(bill);
        }
        return bill;
    }

    public BillsEntity createNonFoodBill(BillsEntity bill , ObjectId tripId){
        bill.setTripId(tripId);
        if(!bill.getSplitBill()){
            billRepository.save(bill);
            EmployeeEntity employee = employeeRepository.findByEmpId(bill.getBillPayer());
            if(employee != null){
                if (employee.getBills() == null) {
                    employee.setBills(new ArrayList<>());
                }
                employee.getBills().add(bill);
                employeeRepository.save(employee);
            }
        }else{
            bill.setNumberOfContributors(bill.getContributorsIds().toArray().length);
            if(bill.getSplitEqually()){
                // Calculate per person share
                Double perShareCost = Math.round(bill.getBillAmt() / bill.getNumberOfContributors() * 100.0) / 100.0;
                bill.setPerPersonShare(perShareCost);
                if (bill.getContributorsIds() != null && !bill.getContributorsIds().isEmpty()) {
                    // Create contributor share map
                    Map<String, Double> contributorShareMap = new HashMap<>();
                    for (String contributorId : bill.getContributorsIds()) {
                        contributorShareMap.put(contributorId, perShareCost);
                    }
                    bill.setContributerShare(contributorShareMap);
                    billRepository.save(bill);
                }
            }else{
                bill.setPerPersonShare(0.0);
                billRepository.save(bill);
            }
            // Fetch all employees with matching empIds
            if (bill.getContributorsIds() != null && !bill.getContributorsIds().isEmpty()) {
                List<EmployeeEntity> contributors = employeeRepository.findByEmpIdIn(bill.getContributorsIds());
                for (EmployeeEntity employee : contributors) {
                    if (employee.getBills() == null) {
                        employee.setBills(new ArrayList<>());
                    }
                    employee.getBills().add(bill);
                    employeeRepository.save(employee);
                }
            }
        }
        TripEntity trip = tripRepository.findById(tripId).orElse(null);
        if (trip != null) {
            trip.getBills().add(bill);
            tripRepository.save(trip);
        }
        return bill;
    }

    public boolean deleteBillEqualSplit(ObjectId billId, ObjectId tripId) {
        // Fetch the bill
        BillsEntity bill = billRepository.findById(billId).orElse(null);
        if (bill == null) {
            throw new IllegalArgumentException("Bill not found with the provided ID.");
        }

        // Fetch the trip
        TripEntity trip = tripService.getTripById(tripId);
        if (trip == null) {
            throw new IllegalArgumentException("Trip not found with the provided ID.");
        }

        // Reverse the totalFoodBill for contributors
        Map<String, Double> totalFoodBill = trip.getTotalFoodBill();
        if (totalFoodBill != null && bill.getContributerShare() != null) {
            for (Map.Entry<String, Double> entry : bill.getContributerShare().entrySet()) {
                String contributorId = entry.getKey();
                Double contribution = entry.getValue();

                // Deduct contribution from total food bill
                totalFoodBill.put(contributorId, totalFoodBill.getOrDefault(contributorId, 0.0) - contribution);
                if (totalFoodBill.get(contributorId) <= 0) {
                    totalFoodBill.remove(contributorId); // Remove if balance is zero
                }
            }
        }
        trip.setTotalFoodBill(totalFoodBill);

        // Reverse dues
        if (bill.getContributerShare() != null) {
            for (Map.Entry<String, Double> entry : bill.getContributerShare().entrySet()) {
                String contributorId = entry.getKey();
                Double contribution = entry.getValue();

                if (!bill.getBillPayer().equalsIgnoreCase(contributorId)) {
                    Map<String, Map<String, Double>> dues = trip.getDues();

                    // Adjust contributor dues
                    Map<String, Double> contributorDues = dues.getOrDefault(contributorId, new HashMap<>());
                    double currentDue = contributorDues.getOrDefault(bill.getBillPayer(), 0.0);

                    if (currentDue > contribution) {
                        contributorDues.put(bill.getBillPayer(), currentDue - contribution);
                    } else if (currentDue == contribution) {
                        contributorDues.remove(bill.getBillPayer());
                    } else {
                        // Reverse due adjustment for bill payer
                        Map<String, Double> payerDues = dues.getOrDefault(bill.getBillPayer(), new HashMap<>());
                        double reverseDue = payerDues.getOrDefault(contributorId, 0.0);

                        payerDues.put(contributorId, reverseDue + (contribution - currentDue));
                        dues.put(bill.getBillPayer(), payerDues);

                        contributorDues.remove(bill.getBillPayer());
                    }

                    if (contributorDues.isEmpty()) {
                        dues.remove(contributorId);
                    } else {
                        dues.put(contributorId, contributorDues);
                    }

                    trip.setDues(dues);
                }
            }
        }



        // Remove bill from contributors
        List<EmployeeEntity> contributors = employeeRepository.findByEmpIdIn(bill.getContributorsIds());
        for (EmployeeEntity employee : contributors) {
            if (employee.getBills() != null) {
                employee.getBills().removeIf(b -> b.getId().equals(billId));
                employeeRepository.save(employee);
            }
        }

        // Remove bill from trip
        if (trip.getBills() != null) {
            trip.getBills().removeIf(b -> b.getId().equals(billId));
        }

        // Save updated trip
        tripRepository.save(trip);

        // Delete bill from repository
        billRepository.delete(bill);
        return true;
    }

    public boolean deleteBillNoSplit(ObjectId billId, ObjectId tripId) {
        // Fetch the bill
        BillsEntity bill = billRepository.findById(billId).orElse(null);
        if (bill == null) {
            throw new IllegalArgumentException("Bill not found with the provided ID.");
        }

        // Fetch the trip
        TripEntity trip = tripService.getTripById(tripId);
        if (trip == null) {
            throw new IllegalArgumentException("Trip not found with the provided ID.");
        }

        // Fetch the employee who paid the bill
        EmployeeEntity employee = employeeRepository.findByEmpId(bill.getBillPayer());
        if (employee == null) {
            throw new IllegalArgumentException("Bill payer not found with the provided ID.");
        }

        // Adjust the totalFoodBill in the TripEntity
        Map<String, Double> totalFoodBills = trip.getTotalFoodBill();
        if (totalFoodBills != null) {
            String billPayer = bill.getBillPayer();
            double currentBillAmount = bill.getBillAmt();

            // Deduct the bill amount from the payer's food bill
            double updatedAmount = totalFoodBills.getOrDefault(billPayer, 0.0) - currentBillAmount;

            if (updatedAmount <= 0) {
                totalFoodBills.remove(billPayer); // Remove if the balance becomes zero or negative
            } else {
                totalFoodBills.put(billPayer, updatedAmount);
            }

            trip.setTotalFoodBill(totalFoodBills);
        }

        // Remove the bill from the trip's bills list
        if (trip.getBills() != null) {
            trip.getBills().removeIf(b -> b.getId().equals(billId));
        }

        // Save the updated trip entity
        tripRepository.save(trip);

        // Remove the bill from the employee's bills list
        if (employee.getBills() != null) {
            employee.getBills().removeIf(b -> b.getId().equals(billId));
        }

        // Save the updated employee entity
        employeeRepository.save(employee);

        // Delete the bill from the repository
        billRepository.delete(bill);

        return true;
    }

    public boolean deleteBillSplitUnequal(ObjectId billId, ObjectId tripId) {
        // Fetch the bill
        BillsEntity bill = billRepository.findById(billId).orElse(null);
        if (bill == null) {
            throw new IllegalArgumentException("Bill not found with the provided ID.");
        }

        // Fetch the trip
        TripEntity trip = tripService.getTripById(tripId);
        if (trip == null) {
            throw new IllegalArgumentException("Trip not found with the provided ID.");
        }

        // Fetch contributors
        List<String> contributorsIds = bill.getContributorsIds();
        List<EmployeeEntity> contributors = employeeRepository.findByEmpIdIn(contributorsIds);

        // Adjust the totalFoodBill
        if (trip.getTotalFoodBill() != null) {
            Map<String, Double> totalFoodBills = trip.getTotalFoodBill();
            for (EmployeeEntity contributor : contributors) {
                String empId = contributor.getEmpId();
                double contributorShare = bill.getContributerShare().getOrDefault(empId, 0.0);

                // Deduct contributor's share from total food bills
                double updatedAmount = totalFoodBills.getOrDefault(empId, 0.0) - contributorShare;
                if (updatedAmount <= 0) {
                    totalFoodBills.remove(empId); // Remove if balance becomes zero or negative
                } else {
                    totalFoodBills.put(empId, updatedAmount);
                }
            }
            trip.setTotalFoodBill(totalFoodBills);
        }

        // Adjust the dues map
        if (trip.getDues() != null) {
            Map<String, Map<String, Double>> dues = trip.getDues();
            String billPayer = bill.getBillPayer();

            for (EmployeeEntity contributor : contributors) {
                String contributorId = contributor.getEmpId();
                double contributorShare = bill.getContributerShare().getOrDefault(contributorId, 0.0);

                // Adjust the dues between billPayer and contributor
                Map<String, Double> payerDues = dues.getOrDefault(billPayer, new HashMap<>());
                Map<String, Double> contributorDues = dues.getOrDefault(contributorId, new HashMap<>());

                // Check if there are existing dues between the two parties
                double existingDueFromContributor = contributorDues.getOrDefault(billPayer, 0.0);
                double existingDueFromPayer = payerDues.getOrDefault(contributorId, 0.0);

                if (existingDueFromContributor > 0) {
                    // Contributor owes payer, adjust the balance
                    if (existingDueFromContributor > contributorShare) {
                        contributorDues.put(billPayer, existingDueFromContributor - contributorShare);
                    } else {
                        contributorDues.remove(billPayer);
                    }
                } else if (existingDueFromPayer > 0) {
                    // Payer owes contributor, adjust the balance
                    if (existingDueFromPayer > contributorShare) {
                        payerDues.put(contributorId, existingDueFromPayer - contributorShare);
                    } else {
                        payerDues.remove(contributorId);
                    }
                }

                // Update the dues map
                if (!payerDues.isEmpty()) {
                    dues.put(billPayer, payerDues);
                } else {
                    dues.remove(billPayer);
                }

                if (!contributorDues.isEmpty()) {
                    dues.put(contributorId, contributorDues);
                } else {
                    dues.remove(contributorId);
                }
            }
            trip.setDues(dues);
        }

        // Remove the bill from the trip's bills list
        if (trip.getBills() != null) {
            trip.getBills().removeIf(b -> b.getId().equals(billId));
        }
        tripRepository.save(trip);

        // Remove the bill from each contributor's bills list
        for (EmployeeEntity contributor : contributors) {
            if (contributor.getBills() != null) {
                contributor.getBills().removeIf(b -> b.getId().equals(billId));
            }
            employeeRepository.save(contributor);
        }

        // Delete the bill from the repository
        billRepository.delete(bill);

        return true;
    }

    public boolean deleteNonFoodBill(ObjectId billId, ObjectId tripId) {
        // Fetch the bill to be deleted
        BillsEntity bill = billRepository.findById(billId).orElse(null);
        if (bill == null) {
            return false; // Bill not found
        }

        // Fetch the trip associated with the bill
        TripEntity trip = tripRepository.findById(tripId).orElse(null);
        if (trip != null && trip.getBills() != null) {
            // Remove the bill from the trip's bill list
            trip.getBills().removeIf(b -> b.getId().equals(billId));
            tripRepository.save(trip); // Save updated trip
        }

        if (!bill.getSplitBill()) {
            // Non-split bill: Remove it from the payer's bills
            EmployeeEntity payer = employeeRepository.findByEmpId(bill.getBillPayer());
            if (payer != null && payer.getBills() != null) {
                payer.getBills().removeIf(b -> b.getId().equals(billId));
                employeeRepository.save(payer); // Save updated payer
            }
        } else {
            // Split bill: Remove from contributors' bills
            if (bill.getContributorsIds() != null && !bill.getContributorsIds().isEmpty()) {
                List<EmployeeEntity> contributors = employeeRepository.findByEmpIdIn(bill.getContributorsIds());
                for (EmployeeEntity contributor : contributors) {
                    if (contributor.getBills() != null) {
                        contributor.getBills().removeIf(b -> b.getId().equals(billId));
                    }
                    employeeRepository.save(contributor); // Save updated contributor
                }
            }
        }

        // Delete the bill from the bill repository
        billRepository.deleteById(billId);

        return true; // Successful deletion
    }

    public BillsEntity updateBill(BillsEntity updatedBill, ObjectId billId, ObjectId tripId) {
        // Analyze the split type

        boolean isSplit = updatedBill.getSplitBill();
        boolean isSplitEqual = updatedBill.getSplitEqually();
        String billType = updatedBill.getBillType();

        // Delete the existing bill
        boolean isDeleted = deleteExistingBill(billId, tripId, isSplit, isSplitEqual, billType);
        if (!isDeleted) {
            throw new RuntimeException("Failed to delete the existing bill");
        }

        // Create a new bill
        return createNewBill(updatedBill, tripId, isSplit, isSplitEqual, billType);
    }

    private boolean deleteExistingBill(ObjectId billId, ObjectId tripId, boolean isSplit, boolean isSplitEqual, String billType) {
        if ("food".equalsIgnoreCase(billType)) {
            if (isSplit) {
                return isSplitEqual
                        ? deleteBillEqualSplit(billId, tripId)
                        : deleteBillSplitUnequal(billId, tripId);
            } else {
                return deleteBillNoSplit(billId, tripId);
            }
        } else {
            return deleteNonFoodBill(billId, tripId);
        }
    }

    private BillsEntity createNewBill(BillsEntity bill, ObjectId tripId, boolean isSplit, boolean isSplitEqual, String billType) {
        if ("food".equalsIgnoreCase(billType)) {
            if (isSplit) {
                return isSplitEqual
                        ? createBillSplitEqual(bill, tripId)
                        : createBillSplitUnequal(bill, tripId);
            } else {
                return createBillNoSplit(bill, tripId);
            }
        } else {
            return createNonFoodBill(bill, tripId);
        }
    }


    public List<BillsEntity> getFoodBillsByEmpId(String empId){
        return billRepositoryImpl.getFoodBillsByEmployeeId(empId);
    }
}
