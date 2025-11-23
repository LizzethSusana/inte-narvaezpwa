package com.hotel.pwa.models.user.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hotel.pwa.models.role.Rol;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
public class UserUpdateDTO {
    private Long id;
    private String fullname;
    private String username;
    @JsonIgnore
    private String password;
    private Boolean active;
    private Rol rol;

    public UserUpdateDTO(Long id, String fullname, String username, Boolean active, Rol rol) {

        this.id = id;
        this.fullname = fullname;
        this.username = username;
        this.active = active;
        this.rol = rol;
    }
}
