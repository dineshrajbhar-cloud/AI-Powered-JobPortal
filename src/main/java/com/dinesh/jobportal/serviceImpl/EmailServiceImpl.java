package com.dinesh.jobportal.serviceImpl;

import com.dinesh.jobportal.service.EmailService;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendApplicationStatusEmail(
            String to,
            String jobTitle,
            String status) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(to);
        message.setSubject("Application Status Update - " + jobTitle);

        message.setText(
                "Dear Candidate,\n\n" +
                        "We are writing to inform you that there has been an update regarding your " +
                        "job application for the position of \"" + jobTitle + "\".\n\n" +

                        "Application Details:\n" +
                        "Position: " + jobTitle + "\n" +
                        "Current Status: " + status + "\n\n" +

                        "Your application status has been updated successfully in our system. " +
                        "We recommend that you regularly check your application details and status " +
                        "through the Job Portal for any further updates or notifications regarding " +
                        "your application.\n\n" +

                        "Please note that the current status reflects the latest update available " +
                        "for your application. Any further changes to your application status will " +
                        "be communicated to you through the Job Portal and, where applicable, via email.\n\n" +

                        "Thank you for your interest in the opportunity and for using our Job Portal. " +
                        "We appreciate your time and effort throughout the application process and " +
                        "wish you continued success in your professional career.\n\n" +

                        "Best Regards,\n" +
                        "Job Portal"
        );

//        message.setText(
//                "Hello,\n\n" +
//                        "Your application for the position of \"" + jobTitle + "\" " +
//                        "has been updated.\n\n" +
//                        "Current Status: " + status + "\n\n" +
//                        "Thank you for using our Job Portal.\n\n" +
//                        "Regards,\n" +
//                        "Job Portal Team"
//        );

        mailSender.send(message);
    }
}