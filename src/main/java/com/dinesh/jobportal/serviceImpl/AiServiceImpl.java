package com.dinesh.jobportal.serviceImpl;

import com.dinesh.jobportal.dto.AiJobMatchResponse;
import com.dinesh.jobportal.service.AiService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AiServiceImpl implements AiService {

    private final RestTemplate restTemplate;

    public AiServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public AiJobMatchResponse matchJobs(MultipartFile file) {

        String url = "http://localhost:8000/ai/match-jobs";

        try {

            ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", resource);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> request =
                    new HttpEntity<>(body, headers);

            ResponseEntity<AiJobMatchResponse> response =
                    restTemplate.postForEntity(
                            url,
                            request,
                            AiJobMatchResponse.class
                    );

            return response.getBody();

        } catch (Exception e) {
            throw new RuntimeException("AI service failed: " + e.getMessage());
        }
    }
}
