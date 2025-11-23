package com.hotel.pwa.controller;

import com.hotel.pwa.entity.Maid;
import com.hotel.pwa.service.MaidService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maids")
@RequiredArgsConstructor
public class MaidController {

    private final MaidService service;

    @GetMapping
    public List<Maid> getAll() { return service.getAll(); }

    @PostMapping
    public Maid create(@RequestBody Maid m) { return service.create(m); }
}
