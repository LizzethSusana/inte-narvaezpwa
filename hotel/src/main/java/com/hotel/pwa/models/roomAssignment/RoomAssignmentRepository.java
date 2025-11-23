package com.hotel.pwa.models.roomAssignment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
//
public interface RoomAssignmentRepository extends JpaRepository<RoomAssignment, Long> {

}
