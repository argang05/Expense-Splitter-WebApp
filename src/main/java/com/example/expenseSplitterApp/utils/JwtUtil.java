package com.example.expenseSplitterApp.utils;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtil {
    private static final String SECRET_KEY = "8f3Q$yH1%zM@rLd5t!F#9jXp*N6AoU2wVk7gCvBqWE4TYxOsZJm"; // Use a secure key

    public static String generateToken(String empId) {
        return Jwts.builder()
                .subject(empId)
                .header() // Define custom header for the JWT.
                .empty() // Start with an empty header.
                .add("typ", "JWT") // Add the type as JWT to the header.
                .and() // Return to the main builder after modifying the header.
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // 10 hours
                .signWith(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()))
                .compact();
    }
}
