package com.fslakws.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fslakws.backend.entity.KeywordSample;

@Repository
public interface KeywordSampleRepository extends JpaRepository<KeywordSample, Integer> {
    List<KeywordSample> findByUserUserId(Integer userId);
}