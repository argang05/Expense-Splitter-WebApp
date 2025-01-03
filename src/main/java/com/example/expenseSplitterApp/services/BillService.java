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
                    employee.setTotalFoodBill(employee.getTotalFoodBill()+perShareCost);
                    if(!(bill.getBillPayer().equalsIgnoreCase(employee.getEmpId()))){
                        employee.getDues().put(bill.getBillPayer(),perShareCost);
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
