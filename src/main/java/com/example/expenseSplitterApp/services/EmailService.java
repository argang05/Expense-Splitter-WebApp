package com.example.expenseSplitterApp.services;

import com.example.expenseSplitterApp.entity.BillsEntity;
import com.example.expenseSplitterApp.entity.TripEntity;
import com.example.expenseSplitterApp.repositories.EmployeeRepositoryImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    @Autowired
    private TripService tripService;

    @Autowired
    private EmployeeRepositoryImpl employeeRepositoryImpl;

    public void sendNewTripNotificationEmail(String to, List<String> cc, TripEntity trip){
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");

        String formattedTripDate = dateFormat.format(trip.getTripDate());

        Calendar calendar = Calendar.getInstance();
        calendar.setTime(trip.getTripDate());
        calendar.add(Calendar.DATE, trip.getNumberOfDays());
        calendar.add(Calendar.DATE, -1); // Subtract 1 day
        Date toDate = calendar.getTime();
        String formattedToDate = dateFormat.format(toDate);

        String subject = "Employee Trip Enrollment Notification";


        String text = "We are delighted to inform that you have been enrolled to the company's trip named: " +
                trip.getTripName() +
                "\n\nTrip Details:" +
                "\nCountry: " + trip.getCountry() +
                "\nFrom Date: " + formattedTripDate +
                "\nTo Date: " + formattedToDate +
                "\nDuration: " + trip.getNumberOfDays() + " days" +
                "\nPurpose: " + trip.getTripPurpose();

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(to);
        message.setCc(cc.toArray(new String[0])); // Convert List<String> to String[]
        message.setSubject(subject);
        message.setText(text);
        javaMailSender.send(message);

    }

    public void sendNewBillNotificationEmail(String to, List<String> cc, BillsEntity bill) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
        String formattedBillDate = dateFormat.format(bill.getBillDate());

        String subject = "Employee Bill Creation Notification";

        // Fetch the trip details
        TripEntity trip = tripService.getTripById(bill.getTripId());

        // Fetch the Bill Payer's name
        String billPayerName = employeeRepositoryImpl.getEmployeeNameById(bill.getBillPayer());

        // Format Contributor Share with names
        StringBuilder contributorShareFormatted = new StringBuilder();
        if (bill.getContributerShare().isEmpty()) {
            contributorShareFormatted.append("No Share");
        } else {
            for (Map.Entry<String, Double> entry : bill.getContributerShare().entrySet()) {
                String contributorName = employeeRepositoryImpl.getEmployeeNameById(entry.getKey());
                contributorShareFormatted.append(contributorName)
                        .append(" : ")
                        .append(trip.getCurrencySymbol())
                        .append(" ")
                        .append(entry.getValue())
                        .append("\n");
            }
        }

        // Compose the email text
        String text = "A Bill Has Been Created In Your Name:" +
                "\n\nBill Details:" +
                "\nBill Type: " + bill.getBillType() +
                "\nBill Amount: " + trip.getCurrencySymbol() + " " + bill.getBillAmt() +
                "\nBill Date: " + formattedBillDate +
                "\nBill Payer: " + billPayerName +
                "\nContributor Share: \n" + contributorShareFormatted.toString();

        // Prepare the email
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        if(!cc.isEmpty()){
            message.setCc(cc.toArray(new String[0])); // Convert List<String> to String[]
        }
        message.setSubject(subject);
        message.setText(text);

        // Send the email
        javaMailSender.send(message);
    }

}
