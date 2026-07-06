package com.fslakws.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import com.fslakws.backend.entity.SearchResult;

@Repository
public interface SearchResultRepository extends JpaRepository<SearchResult, Integer> {
    List<SearchResult> findByUserUserId(Integer userId);
}