package com.hotel.pwa.models.room;

import com.hotel.pwa.utils.APIResponse;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.SQLException;
import java.util.List;

@Service
@AllArgsConstructor
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    @Transactional(readOnly = true)
    public APIResponse findAll(){
        List<Room> categories = roomRepository.findAll();
        return new APIResponse("Operación exitosa", categories, false, HttpStatus.OK);
    }

    @Transactional(readOnly = true)
    public APIResponse findById(Long id){
        try{
            Room found = roomRepository.findById(id).orElse(null);
            if (found == null){
                return new APIResponse("Categoria no encontrada", true, HttpStatus.NOT_FOUND);
            }
            return new APIResponse("Operación exitosa", found, false, HttpStatus.OK);
        }catch (Exception e) {
            e.printStackTrace();
            return new APIResponse("No se puedo consultar la categoria", true, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(rollbackFor = {SQLException.class, Exception.class})
    public APIResponse save(Room payload){
        try {
            roomRepository.save(payload);
            return new APIResponse("Operación exitosa", false, HttpStatus.CREATED);
        }catch (Exception e){
            e.printStackTrace();
            return new APIResponse("No se pudo registrar la categoria", true, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(rollbackFor = {SQLException.class, Exception.class})
    public APIResponse update(Room payload){
        try {
            if (roomRepository.findById(payload.getId()).isEmpty()){
                return new APIResponse("Categoria no encontrada", true, HttpStatus.NOT_FOUND);
            }
            roomRepository.save(payload);
            return new APIResponse("Operación exitosa", false, HttpStatus.OK);
        }catch (Exception e){
            e.printStackTrace();
            return new APIResponse("No se pudo actualizar la categoria", true, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(rollbackFor = {SQLException.class, Exception.class})
    public APIResponse remove(Room payload){
        try {
            if (roomRepository.findById(payload.getId()).isEmpty()){
                return new APIResponse("Categoria no encontrada", true, HttpStatus.NOT_FOUND);
            }
            roomRepository.deleteById(payload.getId());
            return new APIResponse("Operación exitosa", false, HttpStatus.OK);
        }catch (Exception e){
            e.printStackTrace();
            return new APIResponse("No se pudo eliminar la categoria", true, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
   }
