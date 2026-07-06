package com.fslakws.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "Search_History")
public class SearchHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Integer historyId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "result_id", nullable = false)
    private SearchResult searchResult;

    @ManyToOne
    @JoinColumn(name = "keyword_id", nullable = false)
    private KeywordSample keywordSample;

    public SearchHistory() {
    }

    public SearchHistory(User user, SearchResult searchResult, KeywordSample keywordSample) {
        this.user = user;
        this.searchResult = searchResult;
        this.keywordSample = keywordSample;
    }

    public Integer getHistoryId() {
        return historyId;
    }

    public void setHistoryId(Integer historyId) {
        this.historyId = historyId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public SearchResult getSearchResult() {
        return searchResult;
    }

    public void setSearchResult(SearchResult searchResult) {
        this.searchResult = searchResult;
    }

    public KeywordSample getKeywordSample() {
        return keywordSample;
    }

    public void setKeywordSample(KeywordSample keywordSample) {
        this.keywordSample = keywordSample;
    }
}