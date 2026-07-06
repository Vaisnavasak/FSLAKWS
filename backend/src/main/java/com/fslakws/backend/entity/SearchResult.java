package com.fslakws.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "Search_Result")
public class SearchResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "result_id")
    private Integer resultId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "keyword_id", nullable = false)
    private KeywordSample keywordSample;

    @ManyToOne
    @JoinColumn(name = "audio_id", nullable = false)
    private TargetAudio targetAudio;

    @Column(name = "start_time", length = 20)
    private String startTime;

    @Column(name = "end_time", length = 20)
    private String endTime;

    @Column(name = "created_date", insertable = false, updatable = false)
    private LocalDateTime createdDate;

    public SearchResult() {
    }

    public SearchResult(User user, KeywordSample keywordSample, TargetAudio targetAudio,
                         String startTime, String endTime) {
        this.user = user;
        this.keywordSample = keywordSample;
        this.targetAudio = targetAudio;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public Integer getResultId() {
        return resultId;
    }

    public void setResultId(Integer resultId) {
        this.resultId = resultId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public KeywordSample getKeywordSample() {
        return keywordSample;
    }

    public void setKeywordSample(KeywordSample keywordSample) {
        this.keywordSample = keywordSample;
    }

    public TargetAudio getTargetAudio() {
        return targetAudio;
    }

    public void setTargetAudio(TargetAudio targetAudio) {
        this.targetAudio = targetAudio;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }
}