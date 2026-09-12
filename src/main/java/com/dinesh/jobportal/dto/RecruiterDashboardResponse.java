package com.dinesh.jobportal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RecruiterDashboardResponse {

    private long totalJobs;
    private long totalApplications;
    private long pendingApplications;
    private long shortlistedApplications;
    private long interviewApplications;
    private long selectedApplications;
    private long rejectedApplications;

}
