package com.dinesh.jobportal.service;

import com.dinesh.jobportal.dto.ApplicationRequest;
import com.dinesh.jobportal.dto.ApplicationResponse;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import org.springframework.core.io.Resource;

import java.util.List;

public interface ApplicationService {

    ApplicationResponse createApp(ApplicationRequest request);

    List<ApplicationResponse> getAllApp();

    ApplicationResponse getAppById(Long id);

    ApplicationResponse updateApp(ApplicationRequest request, Long id);


    void deleteApp(Long id);

    void uploadResume(Long applicationId, MultipartFile file) throws IOException;

    Resource downloadResume(Long applicationId) throws IOException;
}
