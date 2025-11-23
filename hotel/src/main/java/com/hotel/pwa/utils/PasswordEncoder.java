package com.hotel.pwa.utils;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//
public class PasswordEncoder {
    public static String encodePassword (String rawPassword){
        return new BCryptPasswordEncoder().encode(rawPassword);
    }
    public static boolean verifyPassword (String rawPassword, String encodedPassword){
        return new BCryptPasswordEncoder().matches(rawPassword, encodedPassword);
    }
    public static void main(String[] args) {
        String password ="";
        String encoded =encodePassword("1234");
        System.out.println(password);
        System.out.println(encoded);
        System.out.println(verifyPassword(password,encoded));
    }
}
