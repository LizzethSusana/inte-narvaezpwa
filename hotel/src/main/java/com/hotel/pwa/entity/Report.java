package com.hotel.pwa.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Room room;

    @ManyToOne
    private Maid maid;

    private String description;

    private String photo1;
    private String photo2;
    private String photo3;

    private LocalDateTime createdAt;
}
