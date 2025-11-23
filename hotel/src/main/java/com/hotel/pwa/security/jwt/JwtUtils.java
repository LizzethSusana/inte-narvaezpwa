package com.hotel.pwa.security.jwt;

import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtUtils {
    @Value("${secret.key}")
    private String SECRET_KEY;

    //Esta función ayuda a extraer todas las propiedades del token
    //Es decir, el cuerpo del token

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();
    }

    //Esta funcion nos ayuda a extraer las propiedades del token
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims CLAIMS = extractAllClaims(token);
        return claimsResolver.apply(CLAIMS);
    }

    //Esta funcion extrae el nombre de usuario del token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    //Esta funcion extrae la fecha de expiración
    public Date extractExpirationDate(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    //Esta funcion ayuda a validar si el toekn está expirado
    private Boolean isTokenExpired(String token) {
        return extractExpirationDate(token).before(new Date());
    }

    //Esta función consume la función de arriba
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String USERNAME = extractUsername(token);
        return (USERNAME.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    // Esta función nos ayuda a crear nuestro token
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder() //Aquí decimos que vamos a construir un token
                .setClaims(claims).setSubject(subject) //Aquí mandamos la info del usuario
                .setIssuedAt(new Date(System.currentTimeMillis())) //Aquí le decimos cuando se creó el token
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // Cuánto va a durar
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY) //Aquí lo firmamos
                .compact(); //Terminamos por compactar el token
    }

    //Esta función consume la funcion de crear solo para retornar
    public String genereteToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername());
    }
}