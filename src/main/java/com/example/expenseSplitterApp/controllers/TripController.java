package com.example.expenseSplitterApp.controllers;

import com.example.expenseSplitterApp.dto.EmployeeEntityDTO;
import com.example.expenseSplitterApp.dto.EmployeeFinalExpenseReportDTO;
import com.example.expenseSplitterApp.entity.EmployeeEntity;
import com.example.expenseSplitterApp.entity.TripEntity;
import com.example.expenseSplitterApp.services.EmployeeService;
import com.example.expenseSplitterApp.services.TripService;
import com.example.expenseSplitterApp.utils.ExchangeRateGetterUtil;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trip")
@Slf4j
public class TripController {

    @Autowired
    private TripService tripService;

    @Autowired
    private ExchangeRateGetterUtil exchangeRateGetterUtil;

    @Autowired
    private EmployeeService employeeService;

    @GetMapping("/all")
    public ResponseEntity<?> getAllTrips(){
        try{
            List<TripEntity> trips = tripService.getAllTrips();
            if(trips != null && !trips.isEmpty()){
                return new ResponseEntity<>(trips, HttpStatus.OK);
            }else{
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        }catch (Exception e){
            log.error("Error occurred while fetching trips ",e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/create-trip")
    public ResponseEntity<?> createNewTripEntity(@RequestBody TripEntity trip){
        try {
            tripService.saveNewTrip(trip);
            return new ResponseEntity<>(trip,HttpStatus.CREATED);
        }catch (Exception e){
            log.error("Error occurred while fetching trips ",e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<?> getTripById(@PathVariable String id){
        try {
            ObjectId tripId = new ObjectId(id);
            TripEntity trip = tripService.getTripById(tripId);
            if(trip != null){
                return new ResponseEntity<>(trip,HttpStatus.OK);
            }else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        }catch (Exception e){
            log.error("Error occurred while fetching trips ",e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/group-members/{id}")
    public ResponseEntity<?> getGroupMembersByTripId(@PathVariable String id){
        try{
            ObjectId tripId = new ObjectId(id);
            TripEntity trip = tripService.getTripById(tripId);
            if(trip != null){
                List<String> empIds = trip.getGroupMembersIds();
                List<EmployeeEntity> groupMembers = employeeService.getAllWithEmpIds(empIds);
                if(groupMembers != null && !groupMembers.isEmpty()){
                    List<EmployeeEntityDTO> employeesComp = new ArrayList<>();
                    for(EmployeeEntity employee : groupMembers){
                        EmployeeEntityDTO employeeEntityDTO = new EmployeeEntityDTO();
                        employeeEntityDTO.setEmpId(employee.getEmpId());
                        employeeEntityDTO.setEmpName(employee.getEmpName());
                        employeeEntityDTO.setEmail(employee.getEmail());
                        employeeEntityDTO.setEmpTier(employee.getEmpTier());
                        employeeEntityDTO.setBills(employee.getBills());
                        employeeEntityDTO.setTotalFoodBill(trip.getTotalFoodBill().get(employee.getEmpId()));
                        employeeEntityDTO.setDues(trip.getDues());
                        employeesComp.add(employeeEntityDTO);
                    }
                    return new ResponseEntity<>(employeesComp,HttpStatus.OK);
                }else{
                    return new ResponseEntity<>("No Group Members Found For Trip",HttpStatus.NOT_FOUND);
                }
            }else{
                return new ResponseEntity<>("Trip Entity Not Found!",HttpStatus.NOT_FOUND);
            }
        }catch (Exception e){
            log.error("Error occurred while fetching group members ",e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/getExpenseReport/tripId/{id}")
    public ResponseEntity<?> getEmployeesFullExpenseReport(@PathVariable String id){
        try{
            ObjectId tripId = new ObjectId(id);
            List<EmployeeFinalExpenseReportDTO> employeeFinalExpenseReportDTOList =
                    tripService.getEmployeesFullExpenseReport(tripId);
            if(employeeFinalExpenseReportDTOList != null && !employeeFinalExpenseReportDTOList.isEmpty()){
                return new ResponseEntity<>(employeeFinalExpenseReportDTOList,HttpStatus.OK);
            }else{
                return new ResponseEntity<>("Couldn't Generate Employees Report",HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            log.error("Error occurred while fetching employee expense report ",e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
