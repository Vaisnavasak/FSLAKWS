package com.fslakws.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fslakws.backend.entity.SearchResult;
import com.fslakws.backend.repository.SearchResultRepository;

@Service
public class SearchResultService {

    @Autowired
    private SearchResultRepository searchResultRepository;

    public SearchResult create(SearchResult searchResult) {
        return searchResultRepository.save(searchResult);
    }

    public List<SearchResult> getAll() {
        return searchResultRepository.findAll();
    }

    public Optional<SearchResult> getById(Integer id) {
        return searchResultRepository.findById(id);
    }

    public SearchResult update(Integer id, SearchResult updated) {
        SearchResult existing = searchResultRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Search result not found with id: " + id));

        existing.setUser(updated.getUser());
        existing.setKeywordSample(updated.getKeywordSample());
        existing.setTargetAudio(updated.getTargetAudio());
        existing.setStartTime(updated.getStartTime());
        existing.setEndTime(updated.getEndTime());

        return searchResultRepository.save(existing);
    }

    public void delete(Integer id) {
        searchResultRepository.deleteById(id);
    }
}