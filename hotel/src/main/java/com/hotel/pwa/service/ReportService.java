package com.hotel.pwa.service;

import com.hotel.pwa.entity.*;
import com.hotel.pwa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository repo;
    private final RoomRepository roomRepo;
    private final MaidRepository maidRepo;
    private final FileStorageService fileService;

    public Report crear(Long roomId, Long maidId, String description,
                        String base64, MultipartFile f1, MultipartFile f2, MultipartFile f3) {

        Room room = roomRepo.findById(roomId).orElseThrow();
        Maid maid = maidRepo.findById(maidId).orElseThrow();

        Report r = new Report();
        r.setRoom(room);
        r.setMaid(maid);
        r.setDescription(description);
        r.setCreatedAt(LocalDateTime.now());

        // Guardar fotos
        r.setPhoto1(fileService.save(f1));
        r.setPhoto2(fileService.save(f2));
        r.setPhoto3(fileService.save(f3));

        // La habitación se bloquea automáticamente
        room.setState(RoomState.BLOQUEADA);
        roomRepo.save(room);

        return repo.save(r);
    }
}
