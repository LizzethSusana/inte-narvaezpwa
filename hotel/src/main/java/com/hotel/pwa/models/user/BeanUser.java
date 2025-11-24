package com.hotel.pwa.models.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hotel.pwa.models.report.Report;
import com.hotel.pwa.models.role.Rol;
import com.hotel.pwa.models.roomAssignment.RoomAssignment;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
@Table(name="users")
public class BeanUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fullname", nullable = false)
    private String fullname;

    @Column(name = "username", nullable = false)
    private String username;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "active")
    private Boolean active;

    @ManyToOne
    @JoinColumn(name = "id_rol")
    private Rol rol;

    @OneToMany(mappedBy = "user")
    private List<RoomAssignment> assignments;

    @OneToMany(mappedBy = "user")
    private List<Report> reports;
}
