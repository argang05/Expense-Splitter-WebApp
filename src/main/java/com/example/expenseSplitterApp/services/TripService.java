package com.example.expenseSplitterApp.services;

import com.example.expenseSplitterApp.dto.EmployeeFinalExpenseReportDTO;
import com.example.expenseSplitterApp.entity.EmployeeEntity;
import com.example.expenseSplitterApp.entity.TripEntity;
import com.example.expenseSplitterApp.repositories.TripRepository;
import com.example.expenseSplitterApp.utils.ExchangeRateGetterUtil;
import com.example.expenseSplitterApp.utils.ExpenseCalculatorUtil;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class TripService {

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private ExpenseCalculatorUtil expenseCalculatorUtil;

    @Autowired
    private ExchangeRateGetterUtil exchangeRateGetterUtil;

    public List<TripEntity> getAllTrips(){
        return tripRepository.findAll();
    }

    public void saveNewTrip(TripEntity trip){
        int groupStrength = trip.getGroupMembersIds().toArray().length;
        trip.setGroupStrength(groupStrength);
        trip.setCurrencySymbol(exchangeRateGetterUtil.getCurrencySymbolByCountryName(trip.getCountry()));
        trip.setExhangeRate(Math.round(exchangeRateGetterUtil.getExchangeRate(trip.getCountry())*100.0)/100.0);
        tripRepository.save(trip);
    }

    public TripEntity getTripById(ObjectId tripId){
        return tripRepository.findById(tripId).orElse(null);
    }

    public List<EmployeeFinalExpenseReportDTO> getEmployeesFullExpenseReport(ObjectId tripId){
        TripEntity trip = getTripById(tripId);
        List<EmployeeEntity> groupMembers = employeeService.getAllWithEmpIds(trip.getGroupMembersIds());
        if(groupMembers != null && !groupMembers.isEmpty()){
            List<EmployeeFinalExpenseReportDTO> employeeFinalExpenseReportDTOList = new ArrayList<>();
            int numberOfDays = trip.getNumberOfDays();
            for(EmployeeEntity groupMember : groupMembers){
                String empTier = groupMember.getEmpTier();
                Double perDiemTotalCurrency = expenseCalculatorUtil.calculatePerDiem(empTier,numberOfDays,trip);
                Double billableLimitTotalCurency = expenseCalculatorUtil.calculateBillableLimit(empTier,numberOfDays);
                Double remainingBalanceCurrency = expenseCalculatorUtil.calculateRemainingBalance(empTier,numberOfDays,groupMember.getTotalFoodBill());

                Double perDiemTotal = Math.round(perDiemTotalCurrency * 100.0)/100.0;
                Double billableLimitTotal = Math.round(billableLimitTotalCurency * 100.0)/100.0;
                Double remainingBalance = Math.round(remainingBalanceCurrency * 100.0)/100.0;

                //Form the EmployeeFinalExpenseReportDTO
                EmployeeFinalExpenseReportDTO empExpRepDto = new EmployeeFinalExpenseReportDTO();
                empExpRepDto.setEmpId(groupMember.getEmpId());
                empExpRepDto.setEmpName(groupMember.getEmpName());
                empExpRepDto.setEmail(groupMember.getEmail());
                empExpRepDto.setEmpTier(groupMember.getEmpTier());
                empExpRepDto.setCurrencySymbol(trip.getCurrencySymbol());
                empExpRepDto.setTotalFoodBill(groupMember.getTotalFoodBill());
                empExpRepDto.setPerDiemTotal(perDiemTotal);
                empExpRepDto.setBillableLimitTotal(billableLimitTotal);
                empExpRepDto.setRemainingBalanceTotal(remainingBalance);
                empExpRepDto.setDues(groupMember.getDues());

                //Add to list:
                employeeFinalExpenseReportDTOList.add(empExpRepDto);
            }
            return employeeFinalExpenseReportDTOList;
        }
        return null;
    }
}
