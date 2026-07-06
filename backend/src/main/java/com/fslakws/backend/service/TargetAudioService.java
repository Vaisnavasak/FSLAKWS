package com.fslakws.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fslakws.backend.entity.TargetAudio;
import com.fslakws.backend.repository.TargetAudioRepository;

@Service
public class TargetAudioService {

    @Autowired
    private TargetAudioRepository targetAudioRepository;

    public TargetAudio create(TargetAudio targetAudio) {
        return targetAudioRepository.save(targetAudio);
    }

    public List<TargetAudio> getAll() {
        return targetAudioRepository.findAll();
    }

    public Optional<TargetAudio> getById(Integer id) {
        return targetAudioRepository.findById(id);
    }

    public TargetAudio update(Integer id, TargetAudio updated) {
        TargetAudio existing = targetAudioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Target audio not found with id: " + id));

        existing.setTargetName(updated.getTargetName());
        existing.setUser(updated.getUser());

        return targetAudioRepository.save(existing);
    }

    public void delete(Integer id) {
        targetAudioRepository.deleteById(id);
    }
}