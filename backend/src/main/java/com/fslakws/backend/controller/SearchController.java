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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fslakws.backend.entity.SearchResult;
import com.fslakws.backend.service.SearchService;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "*")
public class SearchController {

    @Autowired
    private SearchService searchService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadAndSearch(
            @RequestParam("userId") Integer userId,
            @RequestParam("keywordName") String keywordName,
            @RequestParam("targetAudio") MultipartFile targetAudio) {
        try {
            return ResponseEntity.ok(searchService.uploadAndSearch(userId, keywordName, targetAudio));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping
    public ResponseEntity<?> search(@RequestBody Map<String, Object> request) {
        try {
            Integer userId = (Integer) request.get("userId");
            Integer keywordId = (Integer) request.get("keywordId");
            Integer audioId = (Integer) request.get("audioId");
            String startTime = (String) request.get("startTime");
            String endTime = (String) request.get("endTime");

            SearchResult result = searchService.performSearch(userId, keywordId, audioId, startTime, endTime);
            return ResponseEntity.ok(result);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}