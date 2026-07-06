package com.fslakws.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fslakws.backend.entity.User;
import com.fslakws.backend.repository.UserRepository;

@RestController
public class DbTestController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/api/db-test")
    public List<Map<String, Object>> testConnection() {
        String sql = "SHOW TABLES";
        return jdbcTemplate.queryForList(sql);
    }

    @GetMapping("/api/entity-test")
    public List<User> testEntity() {
        return userRepository.findAll();
    }
}