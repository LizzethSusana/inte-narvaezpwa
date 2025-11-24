package com.hotel.pwa.models.auth;


import com.hotel.pwa.models.auth.dto.LoginRequestDTO;
import com.hotel.pwa.models.user.BeanUser;
import com.hotel.pwa.utils.APIResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("")
    public ResponseEntity<APIResponse> doLogin(@RequestBody LoginRequestDTO payload){
        APIResponse response = authService.doLogin(payload);
        return new ResponseEntity<>(response,response.getStatus());
    }

    @PostMapping("/register")
    public ResponseEntity<APIResponse> doRegister(@RequestBody BeanUser payload){
        APIResponse response = authService.register(payload);
        return new ResponseEntity<>(response, response.getStatus());
    }
}
