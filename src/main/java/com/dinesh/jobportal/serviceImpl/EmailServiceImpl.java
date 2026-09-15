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
                "Hello,\n\n" +
                        "Your application for the position of \"" + jobTitle + "\" " +
                        "has been updated.\n\n" +
                        "Current Status: " + status + "\n\n" +
                        "Thank you for using our Job Portal.\n\n" +
                        "Regards,\n" +
                        "Job Portal Team"
        );

        mailSender.send(message);
    }
}