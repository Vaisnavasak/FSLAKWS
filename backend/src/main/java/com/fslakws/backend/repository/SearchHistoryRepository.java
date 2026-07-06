package com.fslakws.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fslakws.backend.entity.SearchHistory;

@Repository
public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Integer> {
    List<SearchHistory> findByUserUserId(Integer userId);
}