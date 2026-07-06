package com.fslakws.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fslakws.backend.entity.SearchHistory;
import com.fslakws.backend.repository.SearchHistoryRepository;

@Service
public class SearchHistoryService {

    @Autowired
    private SearchHistoryRepository searchHistoryRepository;

    public SearchHistory create(SearchHistory searchHistory) {
        return searchHistoryRepository.save(searchHistory);
    }

    public List<SearchHistory> getAll() {
        return searchHistoryRepository.findAll();
    }

    public List<SearchHistory> getByUserId(Integer userId) {
        return searchHistoryRepository.findByUserUserId(userId);
    }

    public Optional<SearchHistory> getById(Integer id) {
        return searchHistoryRepository.findById(id);
    }

    public SearchHistory update(Integer id, SearchHistory updated) {
        SearchHistory existing = searchHistoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Search history not found with id: " + id));

        existing.setUser(updated.getUser());
        existing.setSearchResult(updated.getSearchResult());
        existing.setKeywordSample(updated.getKeywordSample());

        return searchHistoryRepository.save(existing);
    }

    public void delete(Integer id) {
        searchHistoryRepository.deleteById(id);
    }
}