package com.pulse.repository.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "emergency_timeline")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmergencyTimeline {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long emergencyId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventType type;
    
    @Column(nullable = false)
    private String title;
    
    private String description;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
    
    public enum EventType {
        CREATED,
        DISPATCHED,
        EN_ROUTE,
        ON_SCENE,
        TRANSPORTING,
        ARRIVED,
        COMPLETED
    }
}
