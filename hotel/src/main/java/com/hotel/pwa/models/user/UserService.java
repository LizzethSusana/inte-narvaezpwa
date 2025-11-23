package com.hotel.pwa.models.user;

import com.hotel.pwa.models.role.Rol;
import com.hotel.pwa.models.role.RolRepository;
import com.hotel.pwa.models.user.dto.UserUpdateDTO;
import com.hotel.pwa.utils.APIResponse;
import com.hotel.pwa.utils.PasswordEncoder;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.SQLException;
import java.util.List;

@Service
//
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RolRepository rolRepository;

    @Transactional(readOnly = true)
    public APIResponse findAll(){
        List<BeanUser> beanUsers = userRepository.findAll();

        List<UserUpdateDTO> userDTOs = beanUsers.stream()
                .map(user -> new UserUpdateDTO(
                        user.getId(),
                        user.getFullname(),
                        user.getUsername(),
                        user.getActive(),
                        user.getRol() != null ? new Rol(user.getRol().getId(), user.getRol().getName(), null) : null
                ))
                .toList();

        return new APIResponse("Operación exitosa", userDTOs, false, HttpStatus.OK);
    }


    @Transactional(readOnly = true)
    public APIResponse findById(Long id){
        try {
            BeanUser found = userRepository.findById(id).orElse(null);
            if(found == null){
                return new APIResponse("Usuario no encontrado", true, HttpStatus.NOT_FOUND);
            }

            UserUpdateDTO dto = new UserUpdateDTO(
                    found.getId(),
                    found.getFullname(),
                    found.getUsername(),
                    found.getActive(),
                    found.getRol() != null
                            ? new Rol(found.getRol().getId(), found.getRol().getName(), null)
                            : null
            );

            return new APIResponse("Operación exitosa", dto, false, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return new APIResponse("No se pudo consultar al usuario", true, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @Transactional(rollbackFor = {SQLException.class, Exception.class})
    public APIResponse registerUser(UserUpdateDTO payload) {
        try {
            if (userRepository.findByUsername(payload.getUsername()).isPresent()) {
                return new APIResponse("Usuario ya existente", true, HttpStatus.BAD_REQUEST);
            }

            Rol rol = rolRepository.findById(payload.getRol().getId())
                    .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

            BeanUser user = new BeanUser();
            user.setFullname(payload.getFullname());
            user.setUsername(payload.getUsername());
            user.setActive(payload.getActive());
            user.setPassword(PasswordEncoder.encodePassword(payload.getPassword()));
            user.setRol(rol);

            userRepository.save(user);
            return new APIResponse("Usuario registrado correctamente", false, HttpStatus.CREATED);

        } catch (Exception e) {
            e.printStackTrace();
            return new APIResponse("Error al registrar usuario", true, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(rollbackFor = {SQLException.class, Exception.class})
    public APIResponse update(UserUpdateDTO dto){
        var optionalUser = userRepository.findById(dto.getId());
        if(optionalUser.isEmpty()){
            return new APIResponse("Usuario no encontrado", true, HttpStatus.NOT_FOUND);
        }
        BeanUser user = optionalUser.get();
        user.setFullname(dto.getFullname());
        user.setUsername(dto.getUsername());
        user.setActive(dto.getActive());
        user.setRol(dto.getRol() == null ? null : rolRepository.findById(dto.getRol().getId()).orElseThrow(() -> new EntityNotFoundException("Rol no encontrado")) );
        userRepository.save(user);
        return new APIResponse("Operación exitosa", false, HttpStatus.OK);
    }


    @Transactional(rollbackFor = {SQLException.class, Exception.class})
    public APIResponse remove(BeanUser payload){
        try{
            if(userRepository.findById(payload.getId()).isEmpty()){
                return new APIResponse("Usuario no encontrado", true, HttpStatus.NOT_FOUND);
            }

            userRepository.deleteById(payload.getId());
            return new APIResponse("Operación exitosa", false, HttpStatus.OK);
        }catch (Exception e){
            e.printStackTrace();
            return new APIResponse("No se pudo eliminar al usuario", true, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
