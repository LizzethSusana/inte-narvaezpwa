package com.hotel.pwa.models.user.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.hotel.pwa.models.role.Rol;
import lombok.Data;


@Data
public class UserUpdateDTO {
    private Long id;
    private String fullname;
    private String username;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
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
