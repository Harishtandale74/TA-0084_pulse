package com.pulse.dto;

import com.pulse.repository.entity.EmergencyTimeline;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TimelineEventResponse {
    private Long id;
    private EmergencyTimeline.EventType type;
    private String title;
    private String description;
    private LocalDateTime timestamp;
    private boolean current;
}
