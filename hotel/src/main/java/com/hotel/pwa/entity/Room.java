package com.hotel.pwa.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String number;

    private boolean rented;

    @Enumerated(EnumType.STRING)
    private RoomState state;
}
