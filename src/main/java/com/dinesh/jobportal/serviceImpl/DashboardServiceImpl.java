package com.dinesh.jobportal.serviceImpl;

import com.dinesh.jobportal.dto.RecruiterDashboardResponse;
import com.dinesh.jobportal.repositories.ApplicationRepository;
import com.dinesh.jobportal.repositories.DashboardRepository;
import com.dinesh.jobportal.repositories.JobRepository;
import com.dinesh.jobportal.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private DashboardRepository dashboardRepository;

    @Override
    public RecruiterDashboardResponse getRecruiterDashboard() {

        long totalJobs = jobRepository.count();

        long totalApplications = applicationRepository.count();

        long pendingApplications =
                dashboardRepository.countByStatus("PENDING");

        long shortlistedApplications =
                dashboardRepository.countByStatus("SHORTLISTED");

        long interviewApplications =
                dashboardRepository.countByStatus("INTERVIEW");

        long selectedApplications =
                dashboardRepository.countByStatus("SELECTED");

        long rejectedApplications =
                dashboardRepository.countByStatus("REJECTED");

        return new RecruiterDashboardResponse(
                totalJobs,
                totalApplications,
                pendingApplications,
                shortlistedApplications,
                interviewApplications,
                selectedApplications,
                rejectedApplications
        );
    }
}