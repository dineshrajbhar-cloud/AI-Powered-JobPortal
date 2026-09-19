package com.dinesh.jobportal.dto;
import lombok.Data;

@Data
public class AiMatchedJob {

    private Long jobId;
    private String title;
    private String company;
    private String location;
    private Double salary;
    private Integer matchPercentage;
    private String reason;
}
