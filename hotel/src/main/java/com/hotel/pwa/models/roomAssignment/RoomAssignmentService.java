package com.hotel.pwa.models.roomAssignment;

import com.hotel.pwa.models.room.Room;
import com.hotel.pwa.models.room.RoomRepository;
import com.hotel.pwa.models.user.UserRepository;
import com.hotel.pwa.utils.APIResponse;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
//
public class RoomAssignmentService {

    @Autowired
    private RoomAssignmentRepository roomAssignmentRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public APIResponse findAll(){
        List<RoomAssignment> assignments = roomAssignmentRepository.findAll();
        return new APIResponse("Operación exitosa", assignments, false, HttpStatus.OK);
    }

    @Transactional(readOnly = true)
    public APIResponse findById(Long id){
        try{
            RoomAssignment found = roomAssignmentRepository.findById(id).orElse(null);
            if (found == null){
                return new APIResponse("Asignación no encontrada", true, HttpStatus.NOT_FOUND);
            }
            return new APIResponse("Operación exitosa", found, false, HttpStatus.OK);
        }catch (Exception e) {
            e.printStackTrace();
            return new APIResponse("No se pudo consultar la asignación", true, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(rollbackFor = {SQLException.class, Exception.class})
    public APIResponse save(RoomAssignment payload){
        try {
            // Validar que el usuario exista
            if (payload.getUser() == null || payload.getUser().getId() == null) {
                return new APIResponse("El usuario es requerido", true, HttpStatus.BAD_REQUEST);
            }
            if (userRepository.findById(payload.getUser().getId()).isEmpty()) {
                return new APIResponse("El usuario no existe", true, HttpStatus.NOT_FOUND);
            }

            // Validar que la habitación exista
            if (payload.getRoom() == null || payload.getRoom().getId() == null) {
                return new APIResponse("La habitación es requerida", true, HttpStatus.BAD_REQUEST);
            }
            if (roomRepository.findById(payload.getRoom().getId()).isEmpty()) {
                return new APIResponse("La habitación no existe", true, HttpStatus.NOT_FOUND);
            }

            // Establecer fecha de asignación automáticamente si no viene
            if (payload.getFechaAsignacion() == null) {
                payload.setFechaAsignacion(LocalDateTime.now());
            }

            roomAssignmentRepository.save(payload);
            return new APIResponse("Asignación registrada correctamente", false, HttpStatus.CREATED);
        }catch (Exception e){
            e.printStackTrace();
            return new APIResponse("No se pudo registrar la asignación", true, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(rollbackFor = {SQLException.class, Exception.class})
    public APIResponse update(RoomAssignment payload){
        try {
            // Validar que la asignación exista
            if (roomAssignmentRepository.findById(payload.getId()).isEmpty()){
                return new APIResponse("Asignación no encontrada", true, HttpStatus.NOT_FOUND);
            }

            // Validar que el usuario exista
            if (payload.getUser() == null || payload.getUser().getId() == null) {
                return new APIResponse("El usuario es requerido", true, HttpStatus.BAD_REQUEST);
            }
            if (userRepository.findById(payload.getUser().getId()).isEmpty()) {
                return new APIResponse("El usuario no existe", true, HttpStatus.NOT_FOUND);
            }

            // Validar que la habitación exista
            if (payload.getRoom() == null || payload.getRoom().getId() == null) {
                return new APIResponse("La habitación es requerida", true, HttpStatus.BAD_REQUEST);
            }
            if (roomRepository.findById(payload.getRoom().getId()).isEmpty()) {
                return new APIResponse("La habitación no existe", true, HttpStatus.NOT_FOUND);
            }

            roomAssignmentRepository.save(payload);
            return new APIResponse("Asignación actualizada correctamente", false, HttpStatus.OK);
        }catch (Exception e){
            e.printStackTrace();
            return new APIResponse("No se pudo actualizar la asignación", true, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(rollbackFor = {SQLException.class, Exception.class})
    public APIResponse remove(RoomAssignment payload){
        try {
            if (roomAssignmentRepository.findById(payload.getId()).isEmpty()){
                return new APIResponse("Asignación no encontrada", true, HttpStatus.NOT_FOUND);
            }
            roomAssignmentRepository.deleteById(payload.getId());
            return new APIResponse("Asignación eliminada correctamente", false, HttpStatus.OK);
        }catch (Exception e){
            e.printStackTrace();
            return new APIResponse("No se pudo eliminar la asignación", true, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
