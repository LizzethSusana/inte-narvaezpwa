package com.hotel.pwa.models.auth;

import com.hotel.pwa.models.auth.dto.LoginRequestDTO;
import com.hotel.pwa.models.role.Rol;
import com.hotel.pwa.models.role.RolRepository;
import com.hotel.pwa.models.user.BeanUser;
import com.hotel.pwa.models.user.UserRepository;
import com.hotel.pwa.security.jwt.JwtUtils;
import com.hotel.pwa.security.jwt.UDService;
import com.hotel.pwa.utils.APIResponse;
import com.hotel.pwa.utils.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.SQLException;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private UDService udService;

    @Autowired
    private JwtUtils jwtUtils;

    @Transactional(readOnly = true)
    public APIResponse doLogin(LoginRequestDTO payload){

        try{
            BeanUser found = userRepository. findByUsername(payload.getUsername()).orElse(null);
            if(found == null) return new APIResponse("Usuario no econtrado", true, HttpStatus.NOT_FOUND);

            if(!PasswordEncoder.verifyPassword(payload.getPassword(), found.getPassword()))
                return new APIResponse("Usuario y/o contraseña incorrectos", true, HttpStatus.BAD_REQUEST);

            UserDetails ud = udService.loadUserByUsername(found.getUsername());
            String token = jwtUtils.genereteToken(ud);
            return new APIResponse("Operación exitosa", token,false, HttpStatus.OK);
        }catch(Exception e){
            e.printStackTrace();
            return new APIResponse("Error al iniciar sesión", true, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(rollbackFor = {SQLException.class,Exception.class})
    public APIResponse register(BeanUser payload){
        try {
            // Validar que el usuario no exista
            BeanUser found = userRepository.findByUsername(payload.getUsername()).orElse(null);
            if (found != null) {
                return new APIResponse("Usuario ya existente", true, HttpStatus.BAD_REQUEST);
            }
            
            // Validar y asegurar que el usuario tenga un rol
            if (payload.getRol() == null || payload.getRol().getId() == null) {
                // Si no viene rol, asignar MAID por defecto (id=2)
                Rol maidRol = rolRepository.findById(2L).orElse(null);
                if (maidRol == null) {
                    return new APIResponse("Rol MAID no encontrado en el sistema", true, HttpStatus.INTERNAL_SERVER_ERROR);
                }
                payload.setRol(maidRol);
            } else {
                // Validar que el rol existe
                Rol rol = rolRepository.findById(payload.getRol().getId()).orElse(null);
                if (rol == null) {
                    return new APIResponse("Rol no encontrado", true, HttpStatus.BAD_REQUEST);
                }
                payload.setRol(rol);
            }
            
            // Encriptar contraseña y guardar
            payload.setPassword(PasswordEncoder.encodePassword(payload.getPassword()));
            userRepository.save(payload);

            return new APIResponse("Operacion exitosa", false, HttpStatus.CREATED);
        }catch (Exception ex) {
            ex.printStackTrace();
            return new APIResponse(
                    "Error al registrar usuario",
                    true,
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
