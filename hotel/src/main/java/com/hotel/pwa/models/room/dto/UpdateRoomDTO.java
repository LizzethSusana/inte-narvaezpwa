package com.hotel.pwa.models.room.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRoomDTO {
    private Long id;
    private String number;
    private String status;
    private Long userId;
}
