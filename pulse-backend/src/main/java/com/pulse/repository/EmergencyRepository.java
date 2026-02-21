package com.pulse.repository;

import com.pulse.repository.entity.Emergency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmergencyRepository extends JpaRepository<Emergency, Long> {
    Optional<Emergency> findByTrackingToken(String trackingToken);
    List<Emergency> findByStatus(Emergency.EmergencyStatus status);
    List<Emergency> findByAssignedAmbulanceId(Long ambulanceId);
    List<Emergency> findByAssignedHospitalId(Long hospitalId);
}
