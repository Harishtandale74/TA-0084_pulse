package com.pulse.service;

import com.pulse.dto.*;
import com.pulse.repository.EmergencyRepository;
import com.pulse.repository.EmergencyTimelineRepository;
import com.pulse.repository.entity.Emergency;
import com.pulse.repository.entity.EmergencyTimeline;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FamilyService {

    private final EmergencyRepository emergencyRepository;
    private final EmergencyTimelineRepository timelineRepository;

    public Optional<EmergencyStatusResponse> getEmergencyStatus(Long emergencyId) {
        return emergencyRepository.findById(emergencyId)
                .map(this::toStatusResponse);
    }

    public Optional<EmergencyStatusResponse> getEmergencyByToken(String token) {
        return emergencyRepository.findByTrackingToken(token)
                .map(this::toStatusResponse);
    }

    public List<TimelineEventResponse> getTimeline(Long emergencyId) {
        List<EmergencyTimeline> events = timelineRepository.findByEmergencyIdOrderByTimestampAsc(emergencyId);
        
        if (events.isEmpty()) {
            // Return default timeline based on current emergency status
            return emergencyRepository.findById(emergencyId)
                    .map(this::generateDefaultTimeline)
                    .orElse(new ArrayList<>());
        }
        
        List<TimelineEventResponse> response = new ArrayList<>();
        for (int i = 0; i < events.size(); i++) {
            EmergencyTimeline event = events.get(i);
            response.add(TimelineEventResponse.builder()
                    .id(event.getId())
                    .type(event.getType())
                    .title(event.getTitle())
                    .description(event.getDescription())
                    .timestamp(event.getTimestamp())
                    .current(i == events.size() - 1)
                    .build());
        }
        return response;
    }

    public void updateNotificationPreferences(Long userId, NotificationPreferencesRequest preferences) {
        // Store notification preferences - in a real app this would be saved to a table
        // For now, we'll just acknowledge the update
    }

    public ConsultationResponse getConsultationLink(Long emergencyId) {
        Optional<Emergency> emergency = emergencyRepository.findById(emergencyId);
        
        if (emergency.isEmpty()) {
            return ConsultationResponse.builder()
                    .available(false)
                    .message("Emergency not found")
                    .build();
        }
        
        Emergency e = emergency.get();
        
        // Generate a consultation room
        String roomId = UUID.randomUUID().toString().substring(0, 8);
        String consultationUrl = "https://meet.pulse.health/room/" + roomId;
        
        return ConsultationResponse.builder()
                .consultationUrl(consultationUrl)
                .roomId(roomId)
                .available(true)
                .message("Consultation room is ready")
                .build();
    }

    private EmergencyStatusResponse toStatusResponse(Emergency e) {
        return EmergencyStatusResponse.builder()
                .id(e.getId())
                .patientName(e.getPatientName())
                .priority(e.getPriority())
                .status(e.getStatus())
                .description(e.getDescription())
                .chiefComplaint(e.getChiefComplaint())
                .latitude(e.getLatitude())
                .longitude(e.getLongitude())
                .address(e.getAddress())
                .etaMinutes(e.getEtaMinutes())
                .estimatedArrival(e.getEstimatedArrival())
                .hospitalName(e.getAssignedHospitalId() != null ? "Assigned Hospital #" + e.getAssignedHospitalId() : null)
                .ambulanceUnit(e.getAssignedAmbulanceId() != null ? "Unit #" + e.getAssignedAmbulanceId() : null)
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    private List<TimelineEventResponse> generateDefaultTimeline(Emergency emergency) {
        List<TimelineEventResponse> timeline = new ArrayList<>();
        Emergency.EmergencyStatus currentStatus = emergency.getStatus();
        
        // Define all possible stages
        EmergencyTimeline.EventType[] stages = {
                EmergencyTimeline.EventType.CREATED,
                EmergencyTimeline.EventType.DISPATCHED,
                EmergencyTimeline.EventType.EN_ROUTE,
                EmergencyTimeline.EventType.ON_SCENE,
                EmergencyTimeline.EventType.TRANSPORTING,
                EmergencyTimeline.EventType.ARRIVED,
                EmergencyTimeline.EventType.COMPLETED
        };
        
        String[] titles = {
                "Emergency Created",
                "Ambulance Dispatched",
                "En Route",
                "On Scene",
                "Transporting to Hospital",
                "Arrived at Hospital",
                "Emergency Completed"
        };
        
        int currentIndex = getCurrentStatusIndex(currentStatus);
        
        for (int i = 0; i < stages.length; i++) {
            timeline.add(TimelineEventResponse.builder()
                    .id((long) (i + 1))
                    .type(stages[i])
                    .title(titles[i])
                    .description(i <= currentIndex ? "Completed" : "Pending")
                    .timestamp(i <= currentIndex ? emergency.getCreatedAt().plusMinutes(i * 5) : null)
                    .current(i == currentIndex)
                    .build());
        }
        
        return timeline;
    }

    private int getCurrentStatusIndex(Emergency.EmergencyStatus status) {
        return switch (status) {
            case CREATED -> 0;
            case DISPATCHED -> 1;
            case EN_ROUTE -> 2;
            case ON_SCENE -> 3;
            case TRANSPORTING -> 4;
            case ARRIVED -> 5;
            case COMPLETED, CANCELLED -> 6;
        };
    }
}
