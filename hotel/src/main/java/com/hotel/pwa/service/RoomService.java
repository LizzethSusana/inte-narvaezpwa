package com.hotel.pwa.service;

import com.hotel.pwa.entity.Room;
import com.hotel.pwa.entity.RoomState;
import com.hotel.pwa.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository repo;

    public List<Room> getAll() { return repo.findAll(); }

    public Room get(Long id) { return repo.findById(id).orElseThrow(); }

    public Room setState(Long id, RoomState state) {
        Room r = get(id);
        r.setState(state);
        return repo.save(r);
    }

    public Room markClean(Long id) { return setState(id, RoomState.LIMPIA); }

    public Room block(Long id) { return setState(id, RoomState.BLOQUEADA); }
}
