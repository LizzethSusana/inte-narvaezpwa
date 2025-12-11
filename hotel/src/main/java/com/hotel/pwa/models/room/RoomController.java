package com.hotel.pwa.models.room;

import com.hotel.pwa.utils.APIResponse;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class RoomController {

    @Autowired
    private final RoomService roomService;

    @GetMapping("")
    public ResponseEntity<APIResponse> findAll() {
        APIResponse response = roomService.findAll();
        return new ResponseEntity<>(response, response.getStatus());
    }

    @GetMapping("/{id}")
    public ResponseEntity<APIResponse> findById(@PathVariable("id") Long id) {
        APIResponse response = roomService.findById(id);
        return new ResponseEntity<>(response, response.getStatus());
    }

    @PostMapping("")
    public ResponseEntity<APIResponse> save(@RequestBody Room payload){
        APIResponse response = roomService.save(payload);
        return new ResponseEntity<>(response, response.getStatus());
    }

    @PostMapping("/batch")
    public ResponseEntity<APIResponse> saveBatch(@RequestBody List<Room> rooms){
        APIResponse response = roomService.saveBatch(rooms);
        return new ResponseEntity<>(response, response.getStatus());
    }

    @PutMapping("")
    public ResponseEntity<APIResponse> update(@RequestBody Room payload){
        APIResponse response = roomService.update(payload);
        return new ResponseEntity<>(response, response.getStatus());
    }

    @DeleteMapping("")
    public ResponseEntity<APIResponse> remove(@RequestBody Room payload){
        APIResponse response = roomService.remove(payload);
        return new ResponseEntity<>(response, response.getStatus());
    }

}

