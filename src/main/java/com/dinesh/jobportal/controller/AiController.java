package com.dinesh.jobportal.controller;
import com.dinesh.jobportal.dto.AiJobMatchResponse;
import com.dinesh.jobportal.service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/match-jobs")
    public ResponseEntity<AiJobMatchResponse> matchJobs(
            @RequestParam("file") MultipartFile file) {

        AiJobMatchResponse response = aiService.matchJobs(file);

        return ResponseEntity.ok(response);
    }
}