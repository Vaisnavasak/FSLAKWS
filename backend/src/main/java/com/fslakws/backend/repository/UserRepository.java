package com.fslakws.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fslakws.backend.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByEmail(String email);
    long countByRole(String role);
}