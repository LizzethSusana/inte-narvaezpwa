package com.hotel.pwa.models.report.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponseDTO {
    private Long id;
    private String title;
    private String description;
    private Boolean active;
    private String photo1;
    private String photo2;
    private String photo3;
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
