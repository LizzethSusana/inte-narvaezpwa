package com.hotel.pwa.security.jwt;

import com.hotel.pwa.models.user.BeanUser;
import com.hotel.pwa.models.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
//
@Service
    public class UDService implements UserDetailsService {

        @Autowired
        private UserRepository userRepository;

        @Override
        public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
            BeanUser found = userRepository.findByUsername(username).orElse(null);
            //Buscar primero al usuario
            if (found == null) {
                throw new UsernameNotFoundException("Usuario no encontrado");
            }

            //Generar las autoridades para el contexto de seguridad
            GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + found.getRol().getName());

            //Retornar el objeto de usuario para registrar en el contexto de seguridad
            return new User(
                    found.getUsername(),
                    found.getPassword(),
                    Collections.singleton(authority)
            );
        }
}
