package com.hotel.pwa.models.user;

import com.hotel.pwa.models.user.dto.UserUpdateDTO;
import com.hotel.pwa.utils.APIResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("")
    public ResponseEntity<APIResponse> findAll() {
        APIResponse response = userService.findAll();
        return new ResponseEntity<>(response, response.getStatus());
    }

    @GetMapping("/{id}")
    public ResponseEntity<APIResponse> findById(@PathVariable("id") Long id) {
        APIResponse response = userService.findById(id);
        return new ResponseEntity<>(response, response.getStatus());
    }

    @PostMapping("")
    public ResponseEntity<APIResponse> registerUser(@RequestBody UserUpdateDTO payload) {
        APIResponse response = userService.registerUser(payload);
        return new ResponseEntity<>(response, response.getStatus());
    }

    @PutMapping("")
    public ResponseEntity<APIResponse> update(@RequestBody UserUpdateDTO payload) {
        APIResponse response = userService.update(payload);
        return new ResponseEntity<>(response, response.getStatus());
    }

    @DeleteMapping("")
    public ResponseEntity<APIResponse> remove(@RequestBody BeanUser payload) {
        APIResponse response = userService.remove(payload);
        return new ResponseEntity<>(response, response.getStatus());
    }


}
