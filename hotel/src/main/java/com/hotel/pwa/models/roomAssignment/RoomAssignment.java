package com.hotel.pwa.models.roomAssignment;

import com.hotel.pwa.models.room.Room;
import com.hotel.pwa.models.user.BeanUser;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "room_assignment")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class RoomAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "date_assigment", nullable = false)
    private LocalDateTime fechaAsignacion;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private BeanUser user;
}
