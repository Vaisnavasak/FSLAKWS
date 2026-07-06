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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fslakws.backend.entity.KeywordSample;
import com.fslakws.backend.service.KeywordSampleService;

@RestController
@RequestMapping("/api/keywords")
@CrossOrigin(origins = "*")
public class KeywordSampleController {

    @Autowired
    private KeywordSampleService keywordSampleService;

    @PostMapping("/enroll")
    public ResponseEntity<?> enroll(
            @RequestParam("userId") Integer userId,
            @RequestParam("keywordName") String keywordName,
            @RequestParam("files") MultipartFile[] files) {
        try {
            return ResponseEntity.ok(keywordSampleService.enroll(userId, keywordName, files));
        } catch (Exception e) {
            java.util.Map<String, String> error = new java.util.HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping
    public ResponseEntity<KeywordSample> create(@RequestBody KeywordSample keywordSample) {
        return ResponseEntity.ok(keywordSampleService.create(keywordSample));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<KeywordSample>> getByUserId(@PathVariable Integer userId) {
        return ResponseEntity.ok(keywordSampleService.getByUserId(userId));
    }

    @GetMapping
    public ResponseEntity<List<KeywordSample>> getAll() {
        return ResponseEntity.ok(keywordSampleService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<KeywordSample> getById(@PathVariable Integer id) {
        return keywordSampleService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<KeywordSample> update(@PathVariable Integer id, @RequestBody KeywordSample keywordSample) {
        return ResponseEntity.ok(keywordSampleService.update(id, keywordSample));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        keywordSampleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}