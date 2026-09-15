package com.dinesh.jobportal.serviceImpl;

import com.dinesh.jobportal.dto.ApplicationRequest;
import com.dinesh.jobportal.dto.ApplicationResponse;
import com.dinesh.jobportal.entity.Application;
import com.dinesh.jobportal.entity.Job;
import com.dinesh.jobportal.entity.User;
import com.dinesh.jobportal.exception.ResourceNotFoundException;
import com.dinesh.jobportal.repositories.ApplicationRepository;
import com.dinesh.jobportal.repositories.JobRepository;
import com.dinesh.jobportal.repositories.UserRepository;
import com.dinesh.jobportal.service.ApplicationService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import com.dinesh.jobportal.entity.ApplicationStatus;
import com.dinesh.jobportal.service.EmailService;

import java.io.File;
import java.io.IOException;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;

    private final UserRepository userRepository;

    private final JobRepository jobRepository;

    private final EmailService emailService;

    public ApplicationServiceImpl(ApplicationRepository applicationRepository, UserRepository userRepository, JobRepository jobRepository, EmailService emailService) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.emailService = emailService;
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    private boolean isRecruiter() {
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_RECRUITER"));
    }

    // throws if the caller is neither a recruiter nor the owner of the application
    private void assertOwnerOrRecruiter(Application application) {
        if (!isRecruiter() && !application.getUser().getId().equals(currentUser().getId())) {
            throw new AccessDeniedException("You don't have permission to access this application");
        }
    }

    private ApplicationResponse toResponse(Application application) {
        ApplicationResponse response = new ApplicationResponse();
        response.setId(application.getId());
        response.setStatus(application.getStatus());
        response.setAppliedAt(application.getAppliedAt());

        response.setUserId(application.getUser().getId());
        response.setUserName(application.getUser().getName());

        response.setJobId(application.getJob().getId());
        response.setJobTitle(application.getJob().getTitle());
        response.setCompany(application.getJob().getCompany());

        return response;
    }

    @Override
    public ApplicationResponse createApp(ApplicationRequest request) {

        // owner is always the logged-in candidate, never taken from the request body
        User user = currentUser();

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        Application application = new Application();

        application.setStatus(request.getStatus());
        application.setAppliedAt(LocalDateTime.now());
        application.setUser(user);
        application.setJob(job);

        Application savedApplication = applicationRepository.save(application);

        return toResponse(savedApplication);
    }

    @Override
    public List<ApplicationResponse> getAllApp() {

        // recruiters see everything, candidates only see their own applications
        List<Application> applications = isRecruiter()
                ? applicationRepository.findAll()
                : applicationRepository.findByUserId(currentUser().getId());

        return applications.stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public ApplicationResponse getAppById(Long id) {

        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));

        assertOwnerOrRecruiter(application);

        return toResponse(application);
    }

    @Override
    public ApplicationResponse updateApp(ApplicationRequest request, Long id) {

        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));

        assertOwnerOrRecruiter(application);

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + request.getJobId()));

        // status and job can be updated; the application's owner cannot be
        // reassigned to another user via the request body
        application.setStatus(request.getStatus());
        application.setJob(job);

        Application updatedApplication = applicationRepository.save(application);

        return toResponse(updatedApplication);
    }

    @Override
    public void deleteApp(Long id) {

        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));

        assertOwnerOrRecruiter(application);

        applicationRepository.deleteById(id);
    }

    @Override
    public void uploadResume(Long applicationId, MultipartFile file) throws IOException {

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Application not found with id: " + applicationId));

        assertOwnerOrRecruiter(application);

        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Original filename
        String original = StringUtils.cleanPath(
                file.getOriginalFilename() == null
                        ? ""
                        : file.getOriginalFilename());

        // File extension
        String extension = original.contains(".")
                ? original.substring(original.lastIndexOf('.')).toLowerCase()
                : "";

        // Content type
        String contentType = file.getContentType();

        // File type validation
        boolean validPdf = ".pdf".equals(extension)
                && ("application/pdf".equals(contentType)
                || "application/octet-stream".equals(contentType));

        boolean validDoc = ".doc".equals(extension)
                && ("application/msword".equals(contentType)
                || "application/octet-stream".equals(contentType));

        boolean validDocx = ".docx".equals(extension)
                && ("application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                .equals(contentType)
                || "application/octet-stream".equals(contentType));

        if (!(validPdf || validDoc || validDocx)) {
            throw new IllegalArgumentException(
                    "Only PDF or Word documents are allowed");
        }

        // Maximum file size = 5 MB
        long maxSizeBytes = 5 * 1024 * 1024;

        if (file.getSize() > maxSizeBytes) {
            throw new IllegalArgumentException(
                    "File too large (max 5MB)");
        }

        // Upload directory
        String uploadDir = "uploads/resumes/";

        File directory = new File(uploadDir);

        if (!directory.exists()) {
            directory.mkdirs();
        }

        // Generate unique filename
        String filename = applicationId + "_" + UUID.randomUUID() + extension;

        // Safe path
        Path path = Paths.get(uploadDir, filename).normalize();

        if (!path.startsWith(Paths.get(uploadDir).normalize())) {
            throw new IllegalArgumentException("Invalid file path");
        }

        // Save file
        Files.copy(file.getInputStream(), path);

        // Save path in database
        application.setResumePath(path.toString());

        applicationRepository.save(application);
    }

    @Override
    public Resource downloadResume(Long applicationId) throws IOException {

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Application not found with id: " + applicationId));

        assertOwnerOrRecruiter(application);

        if (application.getResumePath() == null || application.getResumePath().isBlank()) {
            throw new ResourceNotFoundException("Resume not found for this application");
        }

        Path path = Paths.get(application.getResumePath()).normalize();

        Resource resource = new UrlResource(path.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            throw new ResourceNotFoundException("Resume file not found");
        }

        return resource;
    }

    @Override
    public ApplicationResponse updateStatus(
            Long applicationId,
            ApplicationStatus status) {

        if (!isRecruiter()) {
            throw new AccessDeniedException(
                    "Only recruiters can update application status");
        }

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Application not found with id: " + applicationId));

        application.setStatus(status.name());

        Application updatedApplication =
                applicationRepository.save(application);

        // Send email to candidate
        String candidateEmail = application.getUser().getEmail();
        String jobTitle = application.getJob().getTitle();

        emailService.sendApplicationStatusEmail(
                candidateEmail,
                jobTitle,
                status.name()
        );


        return toResponse(updatedApplication);
    }

}
