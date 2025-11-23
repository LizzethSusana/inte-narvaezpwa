package com.hotel.pwa.service;

import com.hotel.pwa.entity.Maid;
import com.hotel.pwa.repository.MaidRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MaidService {

    private final MaidRepository repo;
    private final PasswordEncoder encoder;

    public List<Maid> getAll() { return repo.findAll(); }

    public Maid create(Maid m) {
        m.setPassword(encoder.encode(m.getPassword()));
        return repo.save(m);
    }
}
