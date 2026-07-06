package com.fslakws.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fslakws.backend.entity.User;
import com.fslakws.backend.entity.KeywordSample;
import com.fslakws.backend.entity.SearchHistory;
import com.fslakws.backend.entity.SearchResult;
import com.fslakws.backend.entity.TargetAudio;
import com.fslakws.backend.repository.UserRepository;
import com.fslakws.backend.repository.KeywordSampleRepository;
import com.fslakws.backend.repository.SearchHistoryRepository;
import com.fslakws.backend.repository.SearchResultRepository;
import com.fslakws.backend.repository.TargetAudioRepository;
import jakarta.transaction.Transactional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private KeywordSampleRepository keywordSampleRepository;

    @Autowired
    private SearchHistoryRepository searchHistoryRepository;

    @Autowired
    private SearchResultRepository searchResultRepository;

    @Autowired
    private TargetAudioRepository targetAudioRepository;

    // CREATE
    public User createUser(User user) {
        return userRepository.save(user);
    }

    // READ - all
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // READ - one
    public Optional<User> getUserById(Integer id) {
        return userRepository.findById(id);
    }

    // UPDATE
    public User updateUser(Integer id, User updatedUser) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        existingUser.setName(updatedUser.getName());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setPassword(updatedUser.getPassword());

        return userRepository.save(existingUser);
    }

    // DELETE
    @Transactional
    public void deleteUser(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // 1. Delete Search History associated with the user
        List<SearchHistory> histories = searchHistoryRepository.findByUserUserId(id);
        searchHistoryRepository.deleteAll(histories);

        // 2. Delete Search Results associated with the user
        List<SearchResult> results = searchResultRepository.findByUserUserId(id);
        searchResultRepository.deleteAll(results);

        // 3. Delete Keyword Samples associated with the user
        List<KeywordSample> keywords = keywordSampleRepository.findByUserUserId(id);
        keywordSampleRepository.deleteAll(keywords);

        // 4. Delete Target Audios associated with the user
        List<TargetAudio> targetAudios = targetAudioRepository.findByUserUserId(id);
        targetAudioRepository.deleteAll(targetAudios);

        // 5. Delete the User record
        userRepository.delete(user);
    }
}