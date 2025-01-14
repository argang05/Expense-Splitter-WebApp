package com.example.expenseSplitterApp.controllers;

import com.example.expenseSplitterApp.dto.EmployeeDTOWithPassword;
import com.example.expenseSplitterApp.dto.EmployeeEntityDTO;
import com.example.expenseSplitterApp.entity.EmployeeEntity;
import com.example.expenseSplitterApp.entity.TripEntity;
import com.example.expenseSplitterApp.services.EmployeeService;
import com.example.expenseSplitterApp.services.TripService;
import com.example.expenseSplitterApp.utils.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employee")
@Slf4j
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private TripService tripService;

    @PostMapping("/signup")
    public ResponseEntity<?> registerEmployee(@RequestBody EmployeeEntity employeeEntity){
        if (employeeEntity.getEmpId().isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        try {
            employeeService.saveEmployee(employeeEntity);
            return new ResponseEntity<>(employeeEntity,HttpStatus.CREATED);
        } catch (Exception e) {
            log.error("Exception Occurred while signing up user: ",e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/signupList")
    public ResponseEntity<?> registerEmployeeList(@RequestBody List<EmployeeEntity> employeeEntityList) {
        try{
            employeeService.saveAllEmployee(employeeEntityList);
            return new ResponseEntity<>(employeeEntityList,HttpStatus.CREATED);
        }catch (Exception e) {
            log.error("Exception Occurred while signing up user: ",e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<?> loginEmployee(@RequestBody EmployeeEntity employeeEntity){
        if (employeeEntity.getEmpId().isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        try {
            EmployeeEntity employee = employeeService.getEmployeeByEmpId(employeeEntity.getEmpId());
            if(employee != null){
                String dbPass = employee.getPassword();
                String inputPass = employeeEntity.getPassword();
                Boolean matches = employeeService.matchPassword(inputPass,dbPass);
                if(matches){
                    // Generate JWT Token
                    String token = jwtUtil.generateToken(employee.getEmpId());

                    // Set token as a cookie
                    ResponseCookie jwtCookie = ResponseCookie.from("jwt", token)
                            .httpOnly(true)
                            .secure(false) // Set false for development
                            .path("/")
                            .maxAge(60 * 60 * 10) // 10 hours
                            .build();

                    return ResponseEntity.status(HttpStatus.OK)
                            .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                            .body(token);
                }else {
                    return new ResponseEntity<>("Incorrect Username/Password",HttpStatus.UNAUTHORIZED);
                }
            }else{
                return new ResponseEntity<>("Incorrect Username/Password",HttpStatus.UNAUTHORIZED);
            }
        } catch (Exception e) {
            log.error("Exception Occurred while signing in user: ",e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllEmployees(){
        try {
            List<EmployeeEntity> employees = employeeService.getAllEmployees();

            if(employees != null && !employees.isEmpty()){
                List<EmployeeEntityDTO> employeesComp = new ArrayList<>();
                for(EmployeeEntity employee : employees) {
                    EmployeeEntityDTO employeeEntityDTO = new EmployeeEntityDTO();
                    employeeEntityDTO.setEmpId(employee.getEmpId());
                    employeeEntityDTO.setEmpName(employee.getEmpName());
                    employeeEntityDTO.setEmail(employee.getEmail());
                    employeeEntityDTO.setEmpTier(employee.getEmpTier());
                    employeeEntityDTO.setBills(employee.getBills());
                    employeesComp.add(employeeEntityDTO);
                }
                return new ResponseEntity<>(employeesComp,HttpStatus.OK);
            }else{
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        }catch (Exception e){
            log.error("Error occurred while getting all employees ",e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/all-employees/tripId/{id}")
    public ResponseEntity<?> getAllEmployeesTripWise(@PathVariable String id){
        try {
            ObjectId tripId = new ObjectId(id);
            List<EmployeeEntity> employees = employeeService.getAllEmployees();

            if(employees != null && !employees.isEmpty()){
                TripEntity trip = tripService.getTripById(tripId);
                List<EmployeeEntityDTO> employeesComp = new ArrayList<>();
                for(EmployeeEntity employee : employees) {
                    EmployeeEntityDTO employeeEntityDTO = new EmployeeEntityDTO();
                    employeeEntityDTO.setEmpId(employee.getEmpId());
                    employeeEntityDTO.setEmpName(employee.getEmpName());
                    employeeEntityDTO.setEmail(employee.getEmail());
                    employeeEntityDTO.setEmpTier(employee.getEmpTier());
                    employeeEntityDTO.setBills(employee.getBills());
                    if(trip != null){
                        employeeEntityDTO.setTotalFoodBill(trip.getTotalFoodBill().get(employee.getEmpId()));
                        employeeEntityDTO.setDues(trip.getDues());
                    }

                    employeesComp.add(employeeEntityDTO);
                }
                return new ResponseEntity<>(employeesComp,HttpStatus.OK);
            }else{
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        }catch (Exception e){
            log.error("Error occurred while getting all employees ",e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/get-all-with-empids/tripId/{id}")
    public ResponseEntity<?> getAllEmployeesWithEmpId(@RequestBody List<String> empIds,@PathVariable String id){
        try{
            ObjectId tripId = new ObjectId(id);
            List<EmployeeEntity> allEmployees = employeeService.getAllWithEmpIds(empIds);

            if(allEmployees != null && !allEmployees.isEmpty()){
                List<EmployeeEntityDTO> employeesComp = new ArrayList<>();
                TripEntity trip = tripService.getTripById(tripId);
                for(EmployeeEntity employee : allEmployees){
                    EmployeeEntityDTO employeeEntityDTO = new EmployeeEntityDTO();
                    employeeEntityDTO.setEmpId(employee.getEmpId());
                    employeeEntityDTO.setEmpName(employee.getEmpName());
                    employeeEntityDTO.setEmail(employee.getEmail());
                    employeeEntityDTO.setEmpTier(employee.getEmpTier());
                    employeeEntityDTO.setBills(employee.getBills());
                    if(trip != null){
                        employeeEntityDTO.setTotalFoodBill(trip.getTotalFoodBill().get(employee.getEmpId()));
                        employeeEntityDTO.setDues(trip.getDues());
                    }
                    employeesComp.add(employeeEntityDTO);
                }
                return new ResponseEntity<>(employeesComp,HttpStatus.OK);
            }else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        }catch (Exception e){
            log.error("Error occurred while getting all employees ",e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/empId/{empId}")
    public ResponseEntity<?> getBasicEmployeeById(@PathVariable String empId){
        try{
            EmployeeEntity employee = employeeService.getEmployeeByEmpId(empId);
            if(employee != null){
                EmployeeEntityDTO employeeEntityDTO = new EmployeeEntityDTO();
                employeeEntityDTO.setEmpId(employee.getEmpId());
                employeeEntityDTO.setEmpName(employee.getEmpName());
                employeeEntityDTO.setEmail(employee.getEmail());
                employeeEntityDTO.setEmpTier(employee.getEmpTier());
                employeeEntityDTO.setBills(employee.getBills());
                return new ResponseEntity<>(employeeEntityDTO,HttpStatus.OK);
            }else{
                return new ResponseEntity<>("Employee Not Found",HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            log.error("Error occurred while getting all employees ",e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/empId-with-pass/{empId}")
    public ResponseEntity<?> getBasicEmployeeByIdWithPassword(@PathVariable String empId){
        try{
            EmployeeEntity employee = employeeService.getEmployeeByEmpId(empId);
            if(employee != null){
                EmployeeDTOWithPassword employeeEntityDTO = new EmployeeDTOWithPassword();
                employeeEntityDTO.setEmpId(employee.getEmpId());
                employeeEntityDTO.setEmpName(employee.getEmpName());
                employeeEntityDTO.setPassword(employee.getPassword());
                employeeEntityDTO.setEmail(employee.getEmail());
                employeeEntityDTO.setEmpTier(employee.getEmpTier());
                return new ResponseEntity<>(employeeEntityDTO,HttpStatus.OK);
            }else{
                return new ResponseEntity<>("Employee Not Found",HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            log.error("Error occurred while getting all employees ",e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/empId/{empId}/tripId/{id}")
    public ResponseEntity<?> getEmployeeById(@PathVariable String empId,@PathVariable String id){
        try{
            ObjectId tripId = new ObjectId(id);
            EmployeeEntity employee = employeeService.getEmployeeByEmpId(empId);
            if(employee != null){
                TripEntity trip = tripService.getTripById(tripId);
                EmployeeEntityDTO employeeEntityDTO = new EmployeeEntityDTO();
                employeeEntityDTO.setEmpId(employee.getEmpId());
                employeeEntityDTO.setEmpName(employee.getEmpName());
                employeeEntityDTO.setEmail(employee.getEmail());
                employeeEntityDTO.setEmpTier(employee.getEmpTier());
                employeeEntityDTO.setBills(employee.getBills());
                if(trip != null){
                    employeeEntityDTO.setTotalFoodBill(trip.getTotalFoodBill().getOrDefault(employee.getEmpId(),0.0));
                    employeeEntityDTO.setDues(trip.getDues());
                }
                return new ResponseEntity<>(employeeEntityDTO,HttpStatus.OK);
            }else{
                return new ResponseEntity<>("Employee Not Found",HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            log.error("Error occurred while getting all employees ",e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/update-emp-details/{empId}")
    public ResponseEntity<?> updateEmployeeDetails(@PathVariable String empId,@RequestBody EmployeeDTOWithPassword employee){
        try{
            employeeService.updateEmployeeDetail(empId,employee);
            return new ResponseEntity<>(employee , HttpStatus.CREATED);
        }catch (Exception e) {
            log.error("Error occurred while getting all employees ",e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


}
