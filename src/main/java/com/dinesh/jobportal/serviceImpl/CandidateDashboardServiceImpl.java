package com.dinesh.jobportal.serviceImpl;

import com.dinesh.jobportal.dto.CandidateDashboardResponse;
import com.dinesh.jobportal.entity.User;
import com.dinesh.jobportal.repositories.ApplicationRepository;
import com.dinesh.jobportal.repositories.UserRepository;
import com.dinesh.jobportal.service.CandidateDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CandidateDashboardServiceImpl
        implements CandidateDashboardService {

    private final ApplicationRepository applicationRepository;

    private final UserRepository userRepository;

    public CandidateDashboardServiceImpl(ApplicationRepository applicationRepository, UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
    }

    @Override
    public CandidateDashboardResponse getCandidateDashboard() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Long userId = user.getId();

        long totalApplications =
                applicationRepository.countByUserId(userId);

        long pendingApplications =
                applicationRepository.countByUserIdAndStatus(
                        userId, "PENDING");

        long shortlistedApplications =
                applicationRepository.countByUserIdAndStatus(
                        userId, "SHORTLISTED");

        long interviewApplications =
                applicationRepository.countByUserIdAndStatus(
                        userId, "INTERVIEW");

        long selectedApplications =
                applicationRepository.countByUserIdAndStatus(
                        userId, "SELECTED");

        long rejectedApplications =
                applicationRepository.countByUserIdAndStatus(
                        userId, "REJECTED");

        return new CandidateDashboardResponse(
                totalApplications,
                pendingApplications,
                shortlistedApplications,
                interviewApplications,
                selectedApplications,
                rejectedApplications
        );
    }
}