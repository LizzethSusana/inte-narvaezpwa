package com.hotel.pwa.config;

import com.hotel.pwa.models.role.Rol;
import com.hotel.pwa.models.role.RolRepository;
import lombok.AllArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.util.Optional;

@Configuration
@AllArgsConstructor
public class InitialConfig implements CommandLineRunner {

    private final RolRepository rolRepository;

    @Override
    public void run(String... args) throws Exception {
        rolRepository.save(new Rol("RECEPTION"));
        rolRepository.save(new Rol("MAID"));
    }

    private Rol getOrCreateRol(String name) {
        Optional<Rol> found = rolRepository.findByName(name);
        if (found.isPresent()) return found.get();

        Rol rol = new Rol();
        rol.setName(name);
        return rolRepository.save(rol);
    }
}
