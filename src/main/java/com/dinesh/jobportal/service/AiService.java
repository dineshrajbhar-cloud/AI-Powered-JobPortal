package com.dinesh.jobportal.service;

import com.dinesh.jobportal.dto.AiJobMatchResponse;
import org.springframework.web.multipart.MultipartFile;

public interface AiService {

    AiJobMatchResponse matchJobs(MultipartFile file);
}