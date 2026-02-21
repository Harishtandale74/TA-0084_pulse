package com.pulse.dto;

import com.pulse.repository.entity.Emergency;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EmergencyStatusResponse {
    private Long id;
    private String patientName;
    private Emergency.Priority priority;
    private Emergency.EmergencyStatus status;
    private String description;
    private String chiefComplaint;
    private Double latitude;
    private Double longitude;
    private String address;
    private Integer etaMinutes;
    private LocalDateTime estimatedArrival;
    private String hospitalName;
    private String ambulanceUnit;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
