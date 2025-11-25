package com.hotel.pwa.security;

import com.hotel.pwa.security.filters.JWTFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;


@Configuration
@EnableWebSecurity
public class MainSecurity {

    private final String[] WHITE_LIST ={
            "/api/auth/**"
    };

    @Autowired
    private JWTFilter jwtFilter;

    @Bean
    public SecurityFilterChain doFilterInternal(HttpSecurity http) throws Exception {
        http.csrf(c -> c.disable())
                .cors(c -> c.configurationSource(corsRegistry()))
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(WHITE_LIST).permitAll()

                        // Ver habitaciones
                        .requestMatchers(HttpMethod.GET, "/api/rooms/**")
                        .hasAnyRole("MAID", "RECEPTION")

                        // Marcar habitación como limpia
                        .requestMatchers(HttpMethod.PUT, "/api/rooms/**")
                        .hasAnyRole("MAID", "RECEPTION")

                        // Levantar siniestro
                        .requestMatchers(HttpMethod.POST, "/api/reports/**")
                        .hasRole("MAID")



                        // CRUD habitaciones
                        .requestMatchers(HttpMethod.POST, "/api/rooms/**")
                        .hasRole("RECEPTION")
                        .requestMatchers(HttpMethod.DELETE, "/api/rooms/**")
                        .hasRole("RECEPTION")

                        // CRUD usuarios (camareras)
                        .requestMatchers("/api/users/**")
                        .hasRole("RECEPTION")

                        // Ver historial de reportes
                        .requestMatchers(HttpMethod.GET, "/api/reports/**")
                        .hasRole("RECEPTION")

                        // Cambiar estatus de habitación (habilitada después de siniestro)
                        .requestMatchers(HttpMethod.PUT, "/api/reports/**")
                        .hasRole("RECEPTION")

                        .anyRequest().authenticated()
                )
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    private CorsConfigurationSource corsRegistry() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}