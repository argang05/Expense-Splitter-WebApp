package com.example.expenseSplitterApp.services;

import com.example.expenseSplitterApp.dto.EmployeeFinalExpenseReportDTO;
import com.example.expenseSplitterApp.entity.BillsEntity;
import com.example.expenseSplitterApp.entity.EmployeeEntity;
import com.example.expenseSplitterApp.entity.ExchangeRateEntity;
import com.example.expenseSplitterApp.entity.TripEntity;
import com.example.expenseSplitterApp.repositories.EmployeeRepository;
import com.example.expenseSplitterApp.repositories.TripRepository;
import com.example.expenseSplitterApp.repositories.TripRepositoryImpl;
import com.example.expenseSplitterApp.utils.ExchangeRateGetterUtil;
import com.example.expenseSplitterApp.utils.ExpenseCalculatorUtil;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class TripService {

    @Value("${admin-empid}")
    private String adminEmpId;

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

    public List<TripEntity> getAllTrips(String empId) {
        if(empId.equalsIgnoreCase(adminEmpId)){
            return tripRepositoryImpl.getAllTripsWithinThreeMonths();
        }else{
            return tripRepositoryImpl.getAllTripsWithinThreeMonthsEmployeeSpecific(empId);
        }
    }

    public void saveNewTrip(TripEntity trip) {
        int groupStrength = trip.getGroupMembersIds().toArray().length;
        trip.setGroupStrength(groupStrength);
        trip.setCurrencySymbol(exchangeRateGetterUtil.getCurrencySymbolByCountryName(trip.getCountry()));
        trip.setExchangeRate(Math.round(exchangeRateGetterUtil.getExchangeRate(trip.getCountry()) * 100.0) / 100.0);
        tripRepository.save(trip);
    }

    public TripEntity getTripById(ObjectId tripId) {
        return tripRepository.findById(tripId).orElse(null);
    }

    public List<EmployeeFinalExpenseReportDTO> getEmployeesFullExpenseReport(ObjectId tripId) {
        TripEntity trip = getTripById(tripId);
        List<EmployeeEntity> groupMembers = employeeService.getAllWithEmpIds(trip.getGroupMembersIds());
        if (groupMembers != null && !groupMembers.isEmpty()) {
            List<EmployeeFinalExpenseReportDTO> employeeFinalExpenseReportDTOList = new ArrayList<>();
            int numberOfDays = trip.getNumberOfDays();
            for (EmployeeEntity groupMember : groupMembers) {
                String empTier = groupMember.getEmpTier();
                Double perDiemTotalCurrency = expenseCalculatorUtil.calculatePerDiem(empTier, numberOfDays, trip);
                Double billableLimitTotalCurency = expenseCalculatorUtil.calculateBillableLimit(empTier, numberOfDays);
                Double remainingBalanceCurrency = expenseCalculatorUtil.calculateRemainingBalance(
                        empTier, numberOfDays, trip.getTotalFoodBill().getOrDefault(groupMember.getEmpId(),0.0)
                );

                Double perDiemTotal = Math.round(perDiemTotalCurrency * 100.0) / 100.0;
                Double billableLimitTotal = Math.round(billableLimitTotalCurency * 100.0) / 100.0;
                Double remainingBalance = Math.round(remainingBalanceCurrency * 100.0) / 100.0;

                //Form the EmployeeFinalExpenseReportDTO
                EmployeeFinalExpenseReportDTO empExpRepDto = new EmployeeFinalExpenseReportDTO();
                empExpRepDto.setEmpId(groupMember.getEmpId());
                empExpRepDto.setEmpName(groupMember.getEmpName());
                empExpRepDto.setEmail(groupMember.getEmail());
                empExpRepDto.setEmpTier(groupMember.getEmpTier());
                empExpRepDto.setCurrencySymbol(trip.getCurrencySymbol());
                empExpRepDto.setTotalFoodBill(trip.getTotalFoodBill().getOrDefault(groupMember.getEmpId(),0.0));
                empExpRepDto.setPerDiemTotal(perDiemTotal);
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
        if(empId.equalsIgnoreCase(adminEmpId)){
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
}

