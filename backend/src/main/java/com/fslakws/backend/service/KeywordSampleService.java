package com.fslakws.backend.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fslakws.backend.entity.KeywordSample;
import com.fslakws.backend.entity.User;
import com.fslakws.backend.repository.KeywordSampleRepository;
import com.fslakws.backend.repository.UserRepository;

@Service
public class KeywordSampleService {

    @Autowired
    private KeywordSampleRepository keywordSampleRepository;

    @Autowired
    private UserRepository userRepository;

    public List<KeywordSample> enroll(Integer userId, String keywordName, MultipartFile[] files) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (files == null || files.length != 5) {
            throw new RuntimeException("Please upload exactly 5 audio samples!");
        }

        // Define target directory relative to backend root
        String uploadDir = "uploads" + File.separator + "keywords" + File.separator + userId;
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        List<KeywordSample> savedSamples = new ArrayList<>();
        for (int i = 0; i < files.length; i++) {
            MultipartFile file = files[i];
            String originalName = file.getOriginalFilename();
            String extension = ".wav";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }
            
            // Clean keywordName to avoid directory traversal
            String safeKeywordName = keywordName.replaceAll("[^a-zA-Z0-9_-]", "_");
            String filename = safeKeywordName + "_" + i + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;
            Path filePath = Paths.get(uploadDir, filename);
            
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            KeywordSample sample = new KeywordSample(user, keywordName, filePath.toString());
            savedSamples.add(keywordSampleRepository.save(sample));
        }
        return savedSamples;
    }

    public KeywordSample create(KeywordSample keywordSample) {
        return keywordSampleRepository.save(keywordSample);
    }

    public List<KeywordSample> getAll() {
        return keywordSampleRepository.findAll();
    }

    public List<KeywordSample> getByUserId(Integer userId) {
        return keywordSampleRepository.findByUserUserId(userId);
    }

    public Optional<KeywordSample> getById(Integer id) {
        return keywordSampleRepository.findById(id);
    }

    public KeywordSample update(Integer id, KeywordSample updated) {
        KeywordSample existing = keywordSampleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Keyword sample not found with id: " + id));

        existing.setKeywordName(updated.getKeywordName());
        existing.setAudioFilePath(updated.getAudioFilePath());
        existing.setUser(updated.getUser());

        return keywordSampleRepository.save(existing);
    }

    public void delete(Integer id) {
        keywordSampleRepository.deleteById(id);
    }
}