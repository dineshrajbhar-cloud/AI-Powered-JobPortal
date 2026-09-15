package com.dinesh.jobportal.serviceImpl;

import com.dinesh.jobportal.dto.JobRequest;
import com.dinesh.jobportal.dto.JobResponse;
import com.dinesh.jobportal.entity.Job;
import com.dinesh.jobportal.repositories.JobRepository;
import com.dinesh.jobportal.service.JobService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;

    public JobServiceImpl(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    @Override
    public JobResponse createJob(JobRequest request) {

        Job job = new Job();

        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setCompany(request.getCompany());
        job.setLocation(request.getLocation());
        job.setSalary(request.getSalary());
        job.setCreatedAt(LocalDateTime.now());

        Job savedJob = jobRepository.save(job);

        JobResponse response = new JobResponse();

        response.setId(savedJob.getId());
        response.setTitle(savedJob.getTitle());
        response.setDescription(savedJob.getDescription());
        response.setCompany(savedJob.getCompany());
        response.setLocation(savedJob.getLocation());
        response.setSalary(savedJob.getSalary());
        response.setCreatedAt(savedJob.getCreatedAt());

        return response;
    }

    @Override
    public List<JobResponse> getAllJobs() {

        List<Job> jobs = jobRepository.findAll();

        return jobs.stream().map(job -> {
               JobResponse response = new JobResponse();
               response.setId(job.getId());
               response.setTitle(job.getTitle());
               response.setDescription(job.getDescription());
               response.setCompany(job.getCompany());
               response.setLocation(job.getLocation());
               response.setSalary(job.getSalary());
               response.setCreatedAt(job.getCreatedAt());

               return response;
        }).toList();
    }

    @Override
    public JobResponse getJobById(Long id) {

        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: "+id));

        JobResponse response = new JobResponse();

        response.setId(job.getId());
        response.setTitle(job.getTitle());
        response.setDescription(job.getDescription());
        response.setCompany(job.getCompany());
        response.setLocation(job.getLocation());
        response.setSalary(job.getSalary());
        response.setCreatedAt(job.getCreatedAt());

        return response;
    }

    @Override
    public JobResponse updateJobById(JobRequest request, Long id) {

        Job job = jobRepository.findById(id).orElseThrow(() ->
                new RuntimeException("Job not found with id: "+id));

        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setCompany(request.getCompany());
        job.setLocation(request.getLocation());
        job.setSalary(request.getSalary());

        Job savedJob = jobRepository.save(job);

        JobResponse response = new JobResponse();

        response.setId(savedJob.getId());
        response.setTitle(savedJob.getTitle());
        response.setDescription(savedJob.getDescription());
        response.setCompany(savedJob.getCompany());
        response.setLocation(savedJob.getLocation());
        response.setSalary(savedJob.getSalary());
        response.setCreatedAt(job.getCreatedAt());

        return response;
    }

    @Override
    public void deleteJobById(Long id) {

        Job job = jobRepository.findById(id).
                orElseThrow(() ->
                new RuntimeException("Job not found with id: "+id));

        jobRepository.deleteById(id);
    }

    @Override
    public List<JobResponse> searchJobs(String title) {

        List<Job> jobs = jobRepository.findByTitleContainingIgnoreCase(title);

        return jobs.stream().map(job -> {

            JobResponse response = new JobResponse();

            response.setId(job.getId());
            response.setTitle(job.getTitle());
            response.setDescription(job.getDescription());
            response.setCompany(job.getCompany());
            response.setLocation(job.getLocation());
            response.setSalary(job.getSalary());
            response.setCreatedAt(job.getCreatedAt());

            return response;

        }).toList();
    }

    @Override
    public List<JobResponse> filterJobs(
            String title,
            String location,
            String company,
            Double minSalary,
            Double maxSalary) {

        List<Job> jobs = jobRepository.findAll();

        return jobs.stream()
                .filter(job -> title == null ||
                        job.getTitle().toLowerCase().contains(title.toLowerCase()))
                .filter(job -> location == null ||
                        job.getLocation().toLowerCase().contains(location.toLowerCase()))
                .filter(job -> company == null ||
                        job.getCompany().toLowerCase().contains(company.toLowerCase()))
                .filter(job -> minSalary == null ||
                        job.getSalary() >= minSalary)
                .filter(job -> maxSalary == null ||
                        job.getSalary() <= maxSalary)
                .map(job -> {

                    JobResponse response = new JobResponse();

                    response.setId(job.getId());
                    response.setTitle(job.getTitle());
                    response.setDescription(job.getDescription());
                    response.setCompany(job.getCompany());
                    response.setLocation(job.getLocation());
                    response.setSalary(job.getSalary());
                    response.setCreatedAt(job.getCreatedAt());

                    return response;
                })
                .toList();
    }

    @Override
    public Page<JobResponse> getAllJobs(Pageable pageable) {

        Page<Job> jobs = jobRepository.findAll(pageable);

        return jobs.map(job -> {

            JobResponse response = new JobResponse();

            response.setId(job.getId());
            response.setTitle(job.getTitle());
            response.setDescription(job.getDescription());
            response.setCompany(job.getCompany());
            response.setLocation(job.getLocation());
            response.setSalary(job.getSalary());
            response.setCreatedAt(job.getCreatedAt());

            return response;
        });
    }
}
