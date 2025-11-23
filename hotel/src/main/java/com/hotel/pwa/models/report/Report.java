package com.hotel.pwa.models.report;

import com.hotel.pwa.models.room.Room;
import com.hotel.pwa.models.user.BeanUser;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "report")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "photo1")
    private String photo1;

    @Column(name = "photo2")
    private String photo2;

    @Column(name = "photo3")
    private String photo3;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private BeanUser user;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;
}
