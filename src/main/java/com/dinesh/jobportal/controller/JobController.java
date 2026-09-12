package com.dinesh.jobportal.controller;

import com.dinesh.jobportal.dto.JobRequest;
import com.dinesh.jobportal.dto.JobResponse;
import com.dinesh.jobportal.service.JobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class JobController {

      @Autowired
      private JobService jobService;

    @PostMapping("/jobs")
    @Tag(name = "Job APIs", description = "Endpoints for managing jobs")
    @Operation(description = "Create Jobs", summary = "APIs to create a Job")
    public ResponseEntity<JobResponse> createJob(@Valid @RequestBody JobRequest request){
        JobResponse create =  jobService.createJob(request);
        return new ResponseEntity<>(create, HttpStatus.CREATED);
    }

    @GetMapping("/jobs")
    @Tag(name = "Job APIs", description = "Endpoints for managing jobs")
    @Operation(description = "Get all Jobs", summary = "APIs to get all jobs")
    public ResponseEntity<List<JobResponse>> getAllJobs(){
        List<JobResponse> getAll = jobService.getAllJobs();
        return new ResponseEntity<>(getAll, HttpStatus.OK);
    }

    @GetMapping("/jobs/{id}")
    @Tag(name = "Job APIs", description = "Endpoints for managing jobs")
    @Operation(description = "Get Job By Id", summary = "APIs to get a job by id")
    public ResponseEntity<JobResponse> getJobById(@PathVariable Long id) {
        JobResponse job = jobService.getJobById(id);
        return ResponseEntity.ok(job);
    }

    @PutMapping("/jobs/{id}")
    @Tag(name = "Job APIs", description = "Endpoints for managing jobs")
    @Operation(description = "Update Job", summary = "APIs to update jobs")
    public ResponseEntity<JobResponse> updateJob(@RequestBody JobRequest request,
                                         @PathVariable Long id){
        JobResponse update = jobService.updateJobById(request, id);

        return new ResponseEntity<>(update, HttpStatus.OK);
    }

    @DeleteMapping("/jobs/{id}")
    @Tag(name = "Job APIs", description = "Endpoints for managing jobs")
    @Operation(description = "Delete Job", summary = "APIs to delete a job")
    public ResponseEntity<String> deleteJob(@PathVariable Long id){
         jobService.deleteJobById(id);
        return ResponseEntity.ok("Job deleted successfully!");
    }

    @GetMapping("/jobs/search")
    @Tag(name = "Job APIs", description = "Endpoints for managing jobs")
    @Operation(description = "Search Jobs", summary = "API to search jobs by title")
    public ResponseEntity<List<JobResponse>> searchJobs(
            @RequestParam String title) {

        List<JobResponse> jobs = jobService.searchJobs(title);

        return ResponseEntity.ok(jobs);
    }

}
