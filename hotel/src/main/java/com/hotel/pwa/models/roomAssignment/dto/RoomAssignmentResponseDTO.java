package com.hotel.pwa.models.roomAssignment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomAssignmentResponseDTO {
    private Long id;
    private LocalDateTime fechaAsignacion;
    private UserBasicDTO user;
    private RoomBasicDTO room;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserBasicDTO {
        private Long id;
        private String fullname;
        private String username;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoomBasicDTO {
        private Long id;
        private String number;
        private String status;
    }
}
