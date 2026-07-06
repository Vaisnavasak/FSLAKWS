package com.fslakws.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fslakws.backend.entity.SearchHistory;
import com.fslakws.backend.service.SearchHistoryService;

@RestController
@RequestMapping("/api/history")
@CrossOrigin(origins = "*")
public class SearchHistoryController {

    @Autowired
    private SearchHistoryService searchHistoryService;

    @PostMapping
    public ResponseEntity<SearchHistory> create(@RequestBody SearchHistory searchHistory) {
        return ResponseEntity.ok(searchHistoryService.create(searchHistory));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SearchHistory>> getByUserId(@PathVariable Integer userId) {
        return ResponseEntity.ok(searchHistoryService.getByUserId(userId));
    }

    @GetMapping
    public ResponseEntity<List<SearchHistory>> getAll() {
        return ResponseEntity.ok(searchHistoryService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SearchHistory> getById(@PathVariable Integer id) {
        return searchHistoryService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<SearchHistory> update(@PathVariable Integer id, @RequestBody SearchHistory searchHistory) {
        return ResponseEntity.ok(searchHistoryService.update(id, searchHistory));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        searchHistoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}