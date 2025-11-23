package com.hotel.pwa.service;

import com.hotel.pwa.entity.User;
import com.hotel.pwa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository repo;
    private final PasswordEncoder encoder;

    public User validate(String username, String rawPassword) {
        User u = repo.findByUsername(username).orElse(null);
        if (u == null) return null;

        return encoder.matches(rawPassword, u.getPassword()) ? u : null;
    }
}
