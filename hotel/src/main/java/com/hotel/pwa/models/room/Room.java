package com.hotel.pwa.models.room;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hotel.pwa.models.report.Report;
import com.hotel.pwa.models.roomAssignment.RoomAssignment;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "number", nullable = false)
    private String number;

    @Column(name = "status", nullable = false)
    private String status;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoomAssignment> assignments;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Report> reports;
}
