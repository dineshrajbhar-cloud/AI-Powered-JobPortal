package com.dinesh.jobportal.controller;

import com.dinesh.jobportal.dto.CandidateDashboardResponse;
import com.dinesh.jobportal.service.CandidateDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class CandidateDashboardController {

    private final CandidateDashboardService candidateDashboardService;

    public CandidateDashboardController(CandidateDashboardService candidateDashboardService) {
        this.candidateDashboardService = candidateDashboardService;
    }

    @GetMapping("/candidate")
    public ResponseEntity<CandidateDashboardResponse> getCandidateDashboard() {

        CandidateDashboardResponse response =
                candidateDashboardService.getCandidateDashboard();

        return ResponseEntity.ok(response);
    }
}