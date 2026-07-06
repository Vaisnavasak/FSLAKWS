package com.fslakws.backend.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.fslakws.backend.entity.KeywordSample;
import com.fslakws.backend.entity.SearchHistory;
import com.fslakws.backend.entity.SearchResult;
import com.fslakws.backend.entity.TargetAudio;
import com.fslakws.backend.entity.User;
import com.fslakws.backend.repository.KeywordSampleRepository;
import com.fslakws.backend.repository.SearchHistoryRepository;
import com.fslakws.backend.repository.SearchResultRepository;
import com.fslakws.backend.repository.TargetAudioRepository;
import com.fslakws.backend.repository.UserRepository;

@Service
public class SearchService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private KeywordSampleRepository keywordSampleRepository;

    @Autowired
    private TargetAudioRepository targetAudioRepository;

    @Autowired
    private SearchResultRepository searchResultRepository;

    @Autowired
    private SearchHistoryRepository searchHistoryRepository;

    public SearchResult performSearch(Integer userId, Integer keywordId, Integer audioId,
                                       String startTime, String endTime) {

        // Step 1 - Validate all referenced records actually exist
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        KeywordSample keyword = keywordSampleRepository.findById(keywordId)
                .orElseThrow(() -> new RuntimeException("Keyword sample not found with id: " + keywordId));

        TargetAudio audio = targetAudioRepository.findById(audioId)
                .orElseThrow(() -> new RuntimeException("Target audio not found with id: " + audioId));

        // Step 2 - Business rule: keyword and audio must belong to the same user
        if (!keyword.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("This keyword does not belong to the requesting user!");
        }
        if (!audio.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("This audio does not belong to the requesting user!");
        }

        // Step 3 - Create the Search Result
        SearchResult result = new SearchResult(user, keyword, audio, startTime, endTime);
        SearchResult savedResult = searchResultRepository.save(result);

        // Step 4 - Automatically log this into Search History
        SearchHistory history = new SearchHistory(user, savedResult, keyword);
        searchHistoryRepository.save(history);

        return savedResult;
    }

    public List<SearchResult> uploadAndSearch(Integer userId, String keywordName, MultipartFile targetAudioFile) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Get enrolled keywords
        List<KeywordSample> enrolledSamples = keywordSampleRepository.findByUserUserId(userId);
        List<KeywordSample> targetSamples = new ArrayList<>();
        for (KeywordSample sample : enrolledSamples) {
            if (sample.getKeywordName().equalsIgnoreCase(keywordName)) {
                targetSamples.add(sample);
            }
        }

        if (targetSamples.isEmpty()) {
            throw new RuntimeException("Keyword '" + keywordName + "' is not enrolled! Please enroll it first with 5 audio samples.");
        }

        // If duplicate enrollments exist, use the most recent 5 samples
        if (targetSamples.size() > 5) {
            targetSamples = targetSamples.subList(targetSamples.size() - 5, targetSamples.size());
        }

        // 1. Save Target Audio to disk
        String uploadDir = "uploads" + File.separator + "targets" + File.separator + userId;
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String originalName = targetAudioFile.getOriginalFilename();
        String extension = ".wav";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        }
        String filename = "target_" + UUID.randomUUID().toString().substring(0, 8) + extension;
        Path targetPath = Paths.get(uploadDir, filename);
        Files.copy(targetAudioFile.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        // 2. Save Target Audio Entity
        TargetAudio targetAudio = new TargetAudio(user, originalName != null ? originalName : filename);
        targetAudio = targetAudioRepository.save(targetAudio);

        // 3. Post files to Flask ML Service
        RestTemplate restTemplate = new RestTemplate();
        String flaskUrl = "http://localhost:5000/api/match";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        // Add keyword samples
        for (KeywordSample sample : targetSamples) {
            File sampleFile = new File(sample.getAudioFilePath());
            if (sampleFile.exists()) {
                body.add("keywordSamples", new FileSystemResource(sampleFile));
            } else {
                body.add("keywordSamples", new FileSystemResource(sampleFile.getAbsoluteFile()));
            }
        }

        // Add target audio
        body.add("targetAudio", new FileSystemResource(targetPath.toFile()));

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        List<SearchResult> searchResults = new ArrayList<>();
        try {
            Map<String, Object> response = restTemplate.postForObject(flaskUrl, requestEntity, Map.class);
            if (response != null && response.containsKey("timestamps")) {
                List<Map<String, Object>> timestamps = (List<Map<String, Object>>) response.get("timestamps");
                
                KeywordSample firstSample = targetSamples.get(0);
                for (Map<String, Object> t : timestamps) {
                    Number timeNum = (Number) t.get("time");
                    double timeVal = (timeNum != null) ? timeNum.doubleValue() : 0.0;
                    String timestampStr = String.format("%.2f", timeVal);
                    
                    // Create SearchResult
                    SearchResult result = new SearchResult(user, firstSample, targetAudio, timestampStr, timestampStr);
                    SearchResult savedResult = searchResultRepository.save(result);
                    searchResults.add(savedResult);

                    // Create SearchHistory
                    SearchHistory history = new SearchHistory(user, savedResult, firstSample);
                    searchHistoryRepository.save(history);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to call ML service: " + e.getMessage(), e);
        }

        return searchResults;
    }
}