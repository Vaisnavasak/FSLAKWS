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

import com.fslakws.backend.entity.TargetAudio;
import com.fslakws.backend.service.TargetAudioService;

@RestController
@RequestMapping("/api/audios")
public class TargetAudioController {

    @Autowired
    private TargetAudioService targetAudioService;

    @PostMapping
    public ResponseEntity<TargetAudio> create(@RequestBody TargetAudio targetAudio) {
        return ResponseEntity.ok(targetAudioService.create(targetAudio));
    }

    @GetMapping
    public ResponseEntity<List<TargetAudio>> getAll() {
        return ResponseEntity.ok(targetAudioService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TargetAudio> getById(@PathVariable Integer id) {
        return targetAudioService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<TargetAudio> update(@PathVariable Integer id, @RequestBody TargetAudio targetAudio) {
        return ResponseEntity.ok(targetAudioService.update(id, targetAudio));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        targetAudioService.delete(id);
        return ResponseEntity.noContent().build();
    }
}