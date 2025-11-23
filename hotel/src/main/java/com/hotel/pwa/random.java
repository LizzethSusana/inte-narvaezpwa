package com.hotel.pwa;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class random
{
    public static void main(String[] args) {
        System.out.println(new BCryptPasswordEncoder().encode("recepcion"));
    }

}
