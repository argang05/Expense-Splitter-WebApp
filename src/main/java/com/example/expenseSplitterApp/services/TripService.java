package com.example.expenseSplitterApp.services;

import com.example.expenseSplitterApp.config.AdminConfig;
import com.example.expenseSplitterApp.dto.EmployeeFinalExpenseReportDTO;
import com.example.expenseSplitterApp.entity.BillsEntity;
import com.example.expenseSplitterApp.entity.EmployeeEntity;
import com.example.expenseSplitterApp.entity.ExchangeRateEntity;
import com.example.expenseSplitterApp.entity.TripEntity;
import com.example.expenseSplitterApp.repositories.*;
import com.example.expenseSplitterApp.utils.ExchangeRateGetterUtil;
import com.example.expenseSplitterApp.utils.ExpenseCalculatorUtil;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Slf4j
public class TripService {

    @Autowired
    private AdminConfig adminConfig;

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private ExpenseCalculatorUtil expenseCalculatorUtil;

    @Autowired
    private ExchangeRateGetterUtil exchangeRateGetterUtil;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private TripRepositoryImpl tripRepositoryImpl;

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private BillRepositoryImpl billRepositoryImpl;

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

    public List<TripEntity> getAllTrips(String empId) {
        if(adminConfig.getAdminEmpIds().contains(empId)){
            return tripRepositoryImpl.getAllTripsWithinThreeMonths();
        }else{
            return tripRepositoryImpl.getAllTripsWithinThreeMonthsEmployeeSpecific(empId);
        }
    }

    public void sendTripEnrollmentNotification(TripEntity trip){
        //Send Emails To The trip
        List<String> gmEmailList = employeeRepositoryImpl.getAllEmailIdsOfEmployees(trip.getGroupMembersIds());

        String to = gmEmailList.get(0);
        List<String> cc = slice(gmEmailList);

        emailService.sendNewTripNotificationEmail(to,cc,trip);
    }

    public void saveNewTrip(TripEntity trip) {
        // Set group strength
        int groupStrength = trip.getGroupMembersIds().toArray().length;
        trip.setGroupStrength(groupStrength);

        // Set currency symbol and exchange rate
        trip.setCurrencySymbol(exchangeRateGetterUtil.getCurrencySymbolByCountryName(trip.getCountry()));
        trip.setExchangeRate(Math.round(exchangeRateGetterUtil.getExchangeRate(trip.getCountry()) * 100.0) / 100.0);

        // Fetch all employees in the trip group
        List<EmployeeEntity> employeeEntityList = employeeService.getAllWithEmpIds(trip.getGroupMembersIds());

        // Initialize the billableLimits map
        Map<String, Double> billableLimits = new HashMap<>();

        // Loop through each employee and calculate their billable limit
        for (EmployeeEntity employee : employeeEntityList) {
            // Fetch employee tier (assuming EmployeeEntity has a method getTier() or similar)
            String empTier = employee.getEmpTier();

            // Calculate billable limit based on employee tier and trip duration
            Double billableLimitTotalCurrency = expenseCalculatorUtil.calculateBillableLimit(empTier, trip.getNumberOfDays());
            Double billableLimitTotal = Math.round(billableLimitTotalCurrency * 100.0) / 100.0;

            // Add the calculated limit to the billableLimits map with the employee ID as the key
            billableLimits.put(employee.getEmpId(), billableLimitTotal);
        }

        // Set the billableLimits map in the TripEntity
        trip.setBillableLimits(billableLimits);

        // Save the trip to the repository
        tripRepository.save(trip);
    }

    public List<String> getGroupMemberEmailIds(ObjectId tripId){
        TripEntity trip = tripRepository.findById(tripId).orElse(null);
        if(trip != null){
            List<String> gmEmailIds = employeeRepositoryImpl.getAllEmailIdsOfEmployees(trip.getGroupMembersIds());
            return gmEmailIds;
        }else{
            return null;
        }
    }

    public TripEntity getTripById(ObjectId tripId) {
        return tripRepository.findById(tripId).orElse(null);
    }

    public List<EmployeeFinalExpenseReportDTO> getEmployeesFullExpenseReport(ObjectId tripId) {
        TripEntity trip = getTripById(tripId);
        List<EmployeeEntity> groupMembers = employeeService.getAllWithEmpIds(trip.getGroupMembersIds());
        if (groupMembers != null && !groupMembers.isEmpty()) {
            List<EmployeeFinalExpenseReportDTO> employeeFinalExpenseReportDTOList = new ArrayList<>();
            // Fetch non-food bills for the trip
            List<BillsEntity> nonFoodBills = billRepositoryImpl.getNonFoodBillsByTripId(tripId);
            int numberOfDays = trip.getNumberOfDays();
            for (EmployeeEntity groupMember : groupMembers) {
                String empTier = groupMember.getEmpTier();
                String empId = groupMember.getEmpId();
                Double perDiemTotalCurrency = expenseCalculatorUtil.calculatePerDiem(empTier, numberOfDays, trip);
                Double billableLimitTotalCurency = expenseCalculatorUtil.calculateBillableLimit(empTier, numberOfDays);
                Double remainingBalanceCurrency = expenseCalculatorUtil.calculateRemainingBalance(
                        empTier, numberOfDays, trip.getTotalFoodBill().getOrDefault(groupMember.getEmpId(),0.0)
                );

                Double perDiemTotal = Math.round(perDiemTotalCurrency * 100.0) / 100.0;
                Double billableLimitTotal = Math.round(billableLimitTotalCurency * 100.0) / 100.0;
                Double remainingBalance = Math.round(remainingBalanceCurrency * 100.0) / 100.0;

                double totalNonFoodBillShare = nonFoodBills.stream()
                        .filter(bill -> {
                            // Check if the employee is a contributor or is the bill payer when `contributerShare` is empty
                            return bill.getContributorsIds().contains(empId) ||
                                    (bill.getContributerShare().isEmpty() && empId.equals(bill.getBillPayer()));
                        })
                        .mapToDouble(bill -> {
                            if (bill.getContributerShare().isEmpty()) {
                                // Add the full bill amount if `contributerShare` is empty and the employee is the bill payer
                                return empId.equals(bill.getBillPayer()) ? bill.getBillAmt() : 0.0;
                            } else {
                                // Otherwise, add the employee's share
                                return bill.getContributerShare().getOrDefault(empId, 0.0);
                            }
                        })
                        .sum();

                totalNonFoodBillShare = Math.round(totalNonFoodBillShare * 100.0) / 100.0;

                //Form the EmployeeFinalExpenseReportDTO
                EmployeeFinalExpenseReportDTO empExpRepDto = new EmployeeFinalExpenseReportDTO();
                empExpRepDto.setEmpId(groupMember.getEmpId());
                empExpRepDto.setEmpName(groupMember.getEmpName());
                empExpRepDto.setEmail(groupMember.getEmail());
                empExpRepDto.setEmpTier(groupMember.getEmpTier());
                empExpRepDto.setCurrencySymbol(trip.getCurrencySymbol());
                empExpRepDto.setTotalFoodBill(trip.getTotalFoodBill().getOrDefault(groupMember.getEmpId(),0.0));
                empExpRepDto.setPerDiemTotal(perDiemTotal);
                empExpRepDto.setTotalNonFoodBill(totalNonFoodBillShare);
                empExpRepDto.setBillableLimitTotal(billableLimitTotal);
                empExpRepDto.setRemainingBalanceTotal(remainingBalance);
                empExpRepDto.setDues(trip.getDues());


                //Add to list:
                employeeFinalExpenseReportDTOList.add(empExpRepDto);
            }
            return employeeFinalExpenseReportDTOList;
        }
        return null;
    }

    public Boolean updateExchangeRate(String empId, ExchangeRateEntity exchangeRateEntity, ObjectId tripId){
        if(adminConfig.getAdminEmpIds().contains(empId)){
            TripEntity trip = tripRepository.findById(tripId).orElse(null);
            if(trip != null){
                trip.setExchangeRate(exchangeRateEntity.getExchangeRate());
                tripRepository.save(trip);
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }

    public List<Map<String, Object>> getDefaulters(ObjectId tripId) {
        TripEntity trip = getTripById(tripId);
        // Fetch all employees participating in the trip
        if(trip != null){
            List<EmployeeEntity> employeeEntityList = employeeService.getAllWithEmpIds(trip.getGroupMembersIds());

            // List to store defaulters' details
            List<Map<String, Object>> defaultersList = new ArrayList<>();

            // Iterate through each employee
            for (EmployeeEntity employee : employeeEntityList) {
                String empId = employee.getEmpId();
                String empName = employee.getEmpName(); // Assuming EmployeeEntity has a `getName()` method

                // Fetch totalFoodBill for this employee from the trip
                Double totalFoodBillUSD = trip.getTotalFoodBill().getOrDefault(empId, 0.0)/trip.getExchangeRate();

                // Fetch the billable limit for this employee from the trip
                Double billableLimit = trip.getBillableLimits().getOrDefault(empId, 0.0);

                // Check if totalFoodBill exceeds billableLimit
                if (totalFoodBillUSD > billableLimit) {
                    // Calculate the excess amount
                    Double excessAmount = Math.round((totalFoodBillUSD - billableLimit) * 100.0) / 100.0;

                    // Create a hashmap to store defaulter details
                    Map<String, Object> defaulterDetails = new HashMap<>();
                    defaulterDetails.put("empName", empName);
                    defaulterDetails.put("totalFoodBill", Math.round(totalFoodBillUSD * 100.0)/100.0);
                    defaulterDetails.put("billableLimit", billableLimit);
                    defaulterDetails.put("excessAmount", excessAmount);

                    // Add defaulter details to the list
                    defaultersList.add(defaulterDetails);
                }
            }

            // Return the list of defaulters
            return defaultersList;
        }else{
            return null;
        }

    }

    public boolean deleteTripAndBills(ObjectId tripId) {
        // First, fetch the trip entity using the tripId
        Optional<TripEntity> trip = tripRepository.findById(tripId);
        if (trip.isPresent()) {
            // Delete all bills associated with this trip
            billRepository.deleteAll(trip.get().getBills());

            // Delete the trip itself
            tripRepository.deleteById(tripId);
            return true;
        } else {
            log.error("No Trip Found!");
            return false;
        }
    }

    public boolean updateTrip(ObjectId tripId, TripEntity updatedTrip) {
        // Step 1: Delete the existing trip by tripId
        boolean isDeleted = deleteTripAndBills(tripId);

        // Step 2: Check if the trip was successfully deleted
        if (!isDeleted) {
            throw new RuntimeException("Failed to delete the existing trip with tripId: " + tripId);
        }

        // Step 3: Save the updated trip details
        saveNewTrip(updatedTrip);
        return true;
    }

}

