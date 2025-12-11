package com.hotel.pwa.models.room;

import com.hotel.pwa.models.room.dto.RoomResponseDTO;
import com.hotel.pwa.models.room.dto.UpdateRoomDTO;
import com.hotel.pwa.models.user.BeanUser;
import com.hotel.pwa.models.user.UserRepository;
import com.hotel.pwa.utils.APIResponse;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public APIResponse findAll(){
        List<Room> rooms = roomRepository.findAllWithUser();
        
        List<RoomResponseDTO> responseDTOs = rooms.stream()
                .map(room -> new RoomResponseDTO(
                        room.getId(),
                        room.getNumber(),
                        room.getStatus(),
                        room.getLastModifiedBy() != null ? room.getLastModifiedBy().getId() : null,
                        room.getLastModifiedBy() != null ? room.getLastModifiedBy().getFullname() : null
                ))
                .collect(Collectors.toList());
        
        return new APIResponse("Operación exitosa", responseDTOs, false, HttpStatus.OK);
    }

    @Transactional(readOnly = true)
    public APIResponse findById(Long id){
        try{
            Room found = roomRepository.findByIdWithUser(id).orElse(null);
            if (found == null){
                return new APIResponse("Habitación no encontrada", true, HttpStatus.NOT_FOUND);
            }
            
            RoomResponseDTO responseDTO = new RoomResponseDTO(
                    found.getId(),
                    found.getNumber(),
                    found.getStatus(),
                    found.getLastModifiedBy() != null ? found.getLastModifiedBy().getId() : null,
                    found.getLastModifiedBy() != null ? found.getLastModifiedBy().getFullname() : null
            );
            
            return new APIResponse("Operación exitosa", responseDTO, false, HttpStatus.OK);
        }catch (Exception e) {
            e.printStackTrace();
            return new APIResponse("No se pudo consultar la habitación", true, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(rollbackFor = {SQLException.class, Exception.class})
    public APIResponse save(Room payload){
        try {
            // Validar que no exista otra habitación con el mismo número
            Room existingRoom = roomRepository.findByNumber(payload.getNumber()).orElse(null);
            if (existingRoom != null) {
                return new APIResponse("Ya existe una habitación con el número " + payload.getNumber(), true, HttpStatus.BAD_REQUEST);
            }
            
            roomRepository.save(payload);
            return new APIResponse("Operación exitosa", false, HttpStatus.CREATED);
        }catch (Exception e){
            e.printStackTrace();
            return new APIResponse("No se pudo registrar la Habitacion", true, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(rollbackFor = {SQLException.class, Exception.class})
    public APIResponse update(UpdateRoomDTO payload){
        try {
            Room room = roomRepository.findById(payload.getId()).orElse(null);
            if (room == null){
                return new APIResponse("Habitacion no encontrada", true, HttpStatus.NOT_FOUND);
            }
            
            // Validar que no exista otra habitación con el mismo número (excepto la actual)
            Room existingRoom = roomRepository.findByNumber(payload.getNumber()).orElse(null);
            if (existingRoom != null && !existingRoom.getId().equals(payload.getId())) {
                return new APIResponse("Ya existe otra habitación con el número " + payload.getNumber(), true, HttpStatus.BAD_REQUEST);
            }
            
            // Actualizar campos
            room.setNumber(payload.getNumber());
            room.setStatus(payload.getStatus());
            
            // Establecer el usuario que modificó (si se proporciona)
            if (payload.getUserId() != null) {
                BeanUser user = userRepository.findById(payload.getUserId()).orElse(null);
                if (user == null) {
                    return new APIResponse("Usuario no encontrado", true, HttpStatus.NOT_FOUND);
                }
                room.setLastModifiedBy(user);
            }
            
            roomRepository.save(room);
            return new APIResponse("Operación exitosa", false, HttpStatus.OK);
        }catch (Exception e){
            e.printStackTrace();
            return new APIResponse("No se pudo actualizar la Habitacion", true, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(rollbackFor = {SQLException.class, Exception.class})
    public APIResponse remove(Room payload){
        try {
            if (roomRepository.findById(payload.getId()).isEmpty()){
                return new APIResponse("Habitacion no encontrada", true, HttpStatus.NOT_FOUND);
            }
            roomRepository.deleteById(payload.getId());
            return new APIResponse("Operación exitosa", false, HttpStatus.OK);
        }catch (Exception e){
            e.printStackTrace();
            return new APIResponse("No se pudo eliminar la Habitacion", true, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(rollbackFor = {SQLException.class, Exception.class})
    public APIResponse saveBatch(List<Room> rooms){
        try {
            if (rooms == null || rooms.isEmpty()) {
                return new APIResponse("No se proporcionaron habitaciones para crear", true, HttpStatus.BAD_REQUEST);
            }
            
            List<String> errors = new ArrayList<>();
            List<Room> roomsToSave = new ArrayList<>();
            
            // Validar cada habitación
            for (Room room : rooms) {
                // Validar que no exista otra habitación con el mismo número
                Room existingRoom = roomRepository.findByNumber(room.getNumber()).orElse(null);
                if (existingRoom != null) {
                    errors.add("La habitación " + room.getNumber() + " ya existe");
                } else {
                    roomsToSave.add(room);
                }
            }
            
            // Guardar todas las habitaciones válidas
            if (!roomsToSave.isEmpty()) {
                roomRepository.saveAll(roomsToSave);
            }
            
            // Preparar respuesta
            String message = roomsToSave.size() + " habitaciones creadas exitosamente";
            if (!errors.isEmpty()) {
                message += ". " + errors.size() + " habitaciones ya existían";
            }
            
            return new APIResponse(message, false, HttpStatus.CREATED);
        }catch (Exception e){
            e.printStackTrace();
            return new APIResponse("No se pudo registrar las habitaciones", true, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
   }
