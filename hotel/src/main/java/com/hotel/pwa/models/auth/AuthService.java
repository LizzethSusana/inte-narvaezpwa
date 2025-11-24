package com.hotel.pwa.models.auth;

import com.hotel.pwa.models.auth.dto.LoginRequestDTO;
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
    private UDService udService;

    @Autowired
    private JwtUtils jwtUtils;

    @Transactional(readOnly = true)
    public APIResponse doLogin(LoginRequestDTO payload){

        try{
            BeanUser found = userRepository. findByUsername(payload.getUsername()).orElse(null);
            if(found == null) return new APIResponse("Usuario no econtrado", true, HttpStatus.NOT_FOUND);

            if(!PasswordEncoder.verifyPassword(payload.getPassword(), found.getPassword()))
                return new APIResponse("Las contraseñas no coinciden", true, HttpStatus.BAD_REQUEST);

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
            BeanUser found = userRepository.findByUsername(payload.getUsername()).orElse(null);
            if (found != null) return new APIResponse("Usuario ya existente",true,HttpStatus.BAD_REQUEST); {
                payload.setPassword(PasswordEncoder.encodePassword(payload.getPassword()));
                userRepository.save(payload);

                return new APIResponse("Operacion exitosa",true,HttpStatus.CREATED);
            }
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
