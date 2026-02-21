package com.pulse.repository;

import com.pulse.repository.entity.EmergencyTimeline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmergencyTimelineRepository extends JpaRepository<EmergencyTimeline, Long> {
    List<EmergencyTimeline> findByEmergencyIdOrderByTimestampAsc(Long emergencyId);
}
