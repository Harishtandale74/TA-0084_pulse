package com.pulse.controller;

import com.pulse.dto.*;
import com.pulse.service.FamilyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/family")
@RequiredArgsConstructor
public class FamilyController {

    private final FamilyService familyService;

    @GetMapping("/emergency/{emergencyId}")
    public ResponseEntity<?> getEmergencyStatus(@PathVariable Long emergencyId) {
        return familyService.getEmergencyStatus(emergencyId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/emergency/track/{token}")
    public ResponseEntity<?> getEmergencyByToken(@PathVariable String token) {
        return familyService.getEmergencyByToken(token)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/emergency/{emergencyId}/timeline")
    public ResponseEntity<List<TimelineEventResponse>> getTimeline(@PathVariable Long emergencyId) {
        List<TimelineEventResponse> timeline = familyService.getTimeline(emergencyId);
        return ResponseEntity.ok(timeline);
    }

    @PutMapping("/notification-preferences")
    public ResponseEntity<?> updateNotificationPreferences(
            @RequestBody NotificationPreferencesRequest preferences) {
        // In a real app, get user ID from security context
        familyService.updateNotificationPreferences(1L, preferences);
        return ResponseEntity.ok(Map.of("message", "Preferences updated successfully"));
    }

    @GetMapping("/emergency/{emergencyId}/consultation")
    public ResponseEntity<ConsultationResponse> getConsultationLink(@PathVariable Long emergencyId) {
        ConsultationResponse response = familyService.getConsultationLink(emergencyId);
        return ResponseEntity.ok(response);
    }
}
