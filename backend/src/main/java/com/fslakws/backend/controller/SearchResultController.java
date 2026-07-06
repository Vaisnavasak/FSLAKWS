package com.fslakws.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fslakws.backend.entity.SearchResult;
import com.fslakws.backend.service.SearchResultService;

@RestController
@RequestMapping("/api/results")
public class SearchResultController {

    @Autowired
    private SearchResultService searchResultService;

    @PostMapping
    public ResponseEntity<SearchResult> create(@RequestBody SearchResult searchResult) {
        return ResponseEntity.ok(searchResultService.create(searchResult));
    }

    @GetMapping
    public ResponseEntity<List<SearchResult>> getAll() {
        return ResponseEntity.ok(searchResultService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SearchResult> getById(@PathVariable Integer id) {
        return searchResultService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<SearchResult> update(@PathVariable Integer id, @RequestBody SearchResult searchResult) {
        return ResponseEntity.ok(searchResultService.update(id, searchResult));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        searchResultService.delete(id);
        return ResponseEntity.noContent().build();
    }
}