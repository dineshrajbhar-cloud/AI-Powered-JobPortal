package com.dinesh.jobportal.controller;

import com.dinesh.jobportal.dto.RecruiterDashboardResponse;
import com.dinesh.jobportal.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/recruiter")
    public ResponseEntity<RecruiterDashboardResponse> getRecruiterDashboard() {

        RecruiterDashboardResponse response =
                dashboardService.getRecruiterDashboard();

        return ResponseEntity.ok(response);
    }
}