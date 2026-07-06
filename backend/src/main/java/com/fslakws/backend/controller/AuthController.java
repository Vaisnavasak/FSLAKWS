package com.fslakws.backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fslakws.backend.entity.User;
import com.fslakws.backend.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User savedUser = authService.register(user);
            return ResponseEntity.ok(toSafeResponse(savedUser));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        try {
            String email = loginRequest.get("email");
            String password = loginRequest.get("password");
            User user = authService.login(email, password);
            return ResponseEntity.ok(toSafeResponse(user));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    // Strips password before sending response to frontend
    private Map<String, Object> toSafeResponse(User user) {
        Map<String, Object> safe = new HashMap<>();
        safe.put("userId", user.getUserId());
        safe.put("name", user.getName());
        safe.put("email", user.getEmail());
        safe.put("role", user.getRole());
        return safe;
    }
}