package com.hotel.pwa.models.roomAssignment;

import com.hotel.pwa.utils.APIResponse;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/room-assignments")
@AllArgsConstructor
@CrossOrigin(origins = "*")
//
public class RoomAssignmentController {

    @Autowired
    private final RoomAssignmentService roomAssignmentService;

    @GetMapping("")
    public ResponseEntity<APIResponse> findAll() {
        APIResponse response = roomAssignmentService.findAll();
        return new ResponseEntity<>(response, response.getStatus());
    }

    @GetMapping("/{id}")
    public ResponseEntity<APIResponse> findById(@PathVariable("id") Long id) {
        APIResponse response = roomAssignmentService.findById(id);
        return new ResponseEntity<>(response, response.getStatus());
    }

    @PostMapping("")
    public ResponseEntity<APIResponse> save(@RequestBody RoomAssignment payload){
        APIResponse response = roomAssignmentService.save(payload);
        return new ResponseEntity<>(response, response.getStatus());
    }

    @PutMapping("")
    public ResponseEntity<APIResponse> update(@RequestBody RoomAssignment payload){
        APIResponse response = roomAssignmentService.update(payload);
        return new ResponseEntity<>(response, response.getStatus());
    }

    @DeleteMapping("")
    public ResponseEntity<APIResponse> remove(@RequestBody RoomAssignment payload){
        APIResponse response = roomAssignmentService.remove(payload);
        return new ResponseEntity<>(response, response.getStatus());
    }
}
