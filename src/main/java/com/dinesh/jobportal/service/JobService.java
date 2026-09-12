package com.dinesh.jobportal.service;

import com.dinesh.jobportal.dto.JobRequest;
import com.dinesh.jobportal.dto.JobResponse;

import java.util.List;

public interface JobService {

    JobResponse createJob(JobRequest request);

    List<JobResponse> getAllJobs();

    JobResponse getJobById(Long id);

    JobResponse updateJobById(JobRequest request, Long id);

    void deleteJobById(Long id);

    List<JobResponse> searchJobs(String title);

    List<JobResponse> filterJobs(
            String title,
            String location,
            String company,
            Double minSalary,
            Double maxSalary
    );


}
