package com.dinesh.jobportal.dto;
import lombok.Data;

import java.util.List;

@Data
public class AiJobMatchResponse {

    private List<AiMatchedJob> matchedJobs;
}