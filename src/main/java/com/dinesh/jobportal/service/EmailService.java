package com.dinesh.jobportal.service;

public interface EmailService {

    void sendApplicationStatusEmail(
            String to,
            String jobTitle,
            String status
    );

}
