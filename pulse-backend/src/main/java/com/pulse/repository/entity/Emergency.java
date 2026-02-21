package com.pulse.repository.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "emergencies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Emergency {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String patientName;
    
    private String patientPhone;
    
    private Integer patientAge;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmergencyStatus status;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String chiefComplaint;
    
    // Location
    private Double latitude;
    private Double longitude;
    private String address;
    
    // Assigned resources
    private Long assignedAmbulanceId;
    private Long assignedHospitalId;
    
    // ETA info
    private Integer etaMinutes;
    private LocalDateTime estimatedArrival;
    
    // Tracking token for family access
    @Column(unique = true)
    private String trackingToken;
    
    // Family contact
    private String familyContactName;
    private String familyContactPhone;
    private String familyContactEmail;
    
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = EmergencyStatus.CREATED;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum Priority {
        P1, P2, P3, P4
    }
    
    public enum EmergencyStatus {
        CREATED,
        DISPATCHED,
        EN_ROUTE,
        ON_SCENE,
        TRANSPORTING,
        ARRIVED,
        COMPLETED,
        CANCELLED
    }
}
