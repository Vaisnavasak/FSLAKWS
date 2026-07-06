package com.fslakws.backend.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.fslakws.backend.entity.User;
import com.fslakws.backend.repository.UserRepository;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    // REGISTER
    public User register(User user) {
        Optional<User> existing = userRepository.findByEmail(user.getEmail());
        if (existing.isPresent()) {
            throw new RuntimeException("Email already registered!");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        if (user.getRole() != null && (user.getRole().equalsIgnoreCase("ADMIN") || user.getRole().equalsIgnoreCase("USER"))) {
            user.setRole(user.getRole().toUpperCase());
        } else if (user.getEmail().toLowerCase().endsWith("@admin.com") || user.getEmail().equalsIgnoreCase("admin@fslakws.com")) {
            user.setRole("ADMIN");
        } else {
            user.setRole("USER");
        }
        
        if ("ADMIN".equals(user.getRole())) {
            long adminCount = userRepository.countByRole("ADMIN");
            if (adminCount > 0) {
                throw new RuntimeException("An administrator is already registered! Only one admin is allowed in the system.");
            }
        }
        
        return userRepository.save(user);
    }

    // LOGIN
    public User login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password!"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid email or password!");
        }

        return user;
    }
}