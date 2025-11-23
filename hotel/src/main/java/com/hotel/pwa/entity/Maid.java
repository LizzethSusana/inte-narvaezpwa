package com.hotel.pwa.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Maid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String username;

    private String password;

    private boolean active = true;
}
