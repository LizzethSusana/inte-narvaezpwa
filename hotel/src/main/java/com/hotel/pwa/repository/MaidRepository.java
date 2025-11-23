package com.hotel.pwa.repository;

import com.hotel.pwa.entity.Maid;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MaidRepository extends JpaRepository<Maid, Long> {
    Optional<Maid> findByUsername(String username);
}
