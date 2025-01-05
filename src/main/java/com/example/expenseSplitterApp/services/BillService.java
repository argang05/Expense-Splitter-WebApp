package com.example.expenseSplitterApp.services;

import com.example.expenseSplitterApp.entity.BillsEntity;
import com.example.expenseSplitterApp.entity.EmployeeEntity;
import com.example.expenseSplitterApp.entity.TripEntity;
import com.example.expenseSplitterApp.repositories.BillRepositoryImpl;
import com.example.expenseSplitterApp.repositories.BillRepository;
import com.example.expenseSplitterApp.repositories.EmployeeRepository;
import com.example.expenseSplitterApp.repositories.TripRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BillService {

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

    public List<BillsEntity> getFoodBillsByTripId(ObjectId tripId){
        return billRepositoryImpl.getFoodBillsByTripId(tripId);
    }

    public BillsEntity createBill(BillsEntity bill,ObjectId tripId){

        bill.setTripId(tripId);
        bill.setNumberOfContributors(bill.getContributorsIds().toArray().length);
        if(bill.getSplitBill()){
            Double perShareCost = Math.round(bill.getBillAmt()/bill.getNumberOfContributors() *100.0) /100.0;
            bill.setPerPersonShare(perShareCost);
            // Populate the contributerShare map
            if (bill.getContributorsIds() != null && !bill.getContributorsIds().isEmpty()) {
                Map<String, Double> contributorShareMap = new HashMap<>();
                for (String contributorId : bill.getContributorsIds()) {
                    contributorShareMap.put(contributorId, perShareCost);
                }
                bill.setContributerShare(contributorShareMap);
                // Fetch all employees with matching empIds
                List<EmployeeEntity> contributors = employeeRepository.findByEmpIdIn(bill.getContributorsIds());

                billRepository.save(bill);

                // Update each employee's bills list and save
                for (EmployeeEntity employee : contributors) {
                    if (employee.getBills() == null) {
                        employee.setBills(new ArrayList<>());
                    }
                    employee.getBills().add(bill);
                    TripEntity trip = tripRepository.findById(tripId).orElse(null);
                    if(trip != null){
                        // Get the existing food bill map or create a new one if it doesn't exist
                        Map<String, Double> totalFoodBills = trip.getTotalFoodBill();
                        if (totalFoodBills == null) {
                            totalFoodBills = new HashMap<>();
                        }

                        // Update the food bill for the specific employee
                        totalFoodBills.put(employee.getEmpId(), totalFoodBills.getOrDefault(employee.getEmpId(), 0.0) + perShareCost);

                        // Set the updated food bill map
                        trip.setTotalFoodBill(totalFoodBills);

                        // Save the updated trip entity
                        tripRepository.save(trip);
                    }

                    if (!(bill.getBillPayer().equalsIgnoreCase(employee.getEmpId()))) {
                        if (trip != null) {
                            // Retrieve the existing dues map or create a new one if it's null
                            Map<String, Map<String, Double>> dues = trip.getDues();
                            if (dues == null) {
                                dues = new HashMap<>();
                            }

                            // Check if the employee already has a due record in the dues map
                            Map<String, Double> dueRecord = dues.get(employee.getEmpId());
                            if (dueRecord == null) {
                                dueRecord = new HashMap<>();
                            }

                            // Add or update the due for the specific bill payer
                            dueRecord.put(bill.getBillPayer(), perShareCost);

                            // Update the dues map for the employee
                            dues.put(employee.getEmpId(), dueRecord);

                            // Save the updated trip entity
                            trip.setDues(dues);
                            tripRepository.save(trip);
                        }
                    }
                    employeeRepository.save(employee); // Save updated employee
                }


            }
        }
        TripEntity trip = tripService.getTripById(bill.getTripId());
        if(trip != null && bill != null){
            trip.getBills().add(bill);
            tripRepository.save(trip);
            billRepository.save(bill);
        }
        return bill;
    }

    public List<BillsEntity> getFoodBillsByEmpId(String empId){
        return billRepositoryImpl.getFoodBillsByEmployeeId(empId);
    }
}
