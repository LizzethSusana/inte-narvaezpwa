package com.hotel.pwa.controller;

import com.hotel.pwa.entity.Report;
import com.hotel.pwa.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService service;

    @PostMapping(value = "/create", consumes = "multipart/form-data")
    public Report create(
            @RequestParam Long roomId,
            @RequestParam Long maidId,
            @RequestParam String description,
            @RequestPart(required=false) MultipartFile photo1,
            @RequestPart(required=false) MultipartFile photo2,
            @RequestPart(required=false) MultipartFile photo3
    ) {
        return service.crear(roomId, maidId, description, null, photo1, photo2, photo3);
    }
}
