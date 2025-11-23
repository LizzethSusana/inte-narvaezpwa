package com.hotel.pwa.controller;

import com.hotel.pwa.entity.Room;
import com.hotel.pwa.entity.RoomState;
import com.hotel.pwa.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RoomController {

    private final RoomService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCION', 'CAMARERA')")
    public List<Room> getAll() {
        return service.getAll();
    }

    @PostMapping("/{id}/clean")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCION', 'CAMARERA')")
    public Room clean(@PathVariable Long id) {
        return service.markClean(id);
    }

    @PostMapping("/{id}/block")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCION')")
    public Room block(@PathVariable Long id) {
        return service.block(id);
    }

    @PostMapping("/{id}/unlock")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCION')")
    public Room unlock(@PathVariable Long id) {
        return service.setState(id, RoomState.LIMPIA);
    }
}

