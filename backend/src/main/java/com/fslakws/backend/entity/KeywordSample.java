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
@Table(name = "Keyword_Sample")
public class KeywordSample {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "keyword_id")
    private Integer keywordId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "keyword_name", nullable = false, length = 100)
    private String keywordName;

    @Column(name = "audio_file_path", nullable = false, length = 255)
    private String audioFilePath;

    public KeywordSample() {
    }

    public KeywordSample(User user, String keywordName, String audioFilePath) {
        this.user = user;
        this.keywordName = keywordName;
        this.audioFilePath = audioFilePath;
    }

    public Integer getKeywordId() {
        return keywordId;
    }

    public void setKeywordId(Integer keywordId) {
        this.keywordId = keywordId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getKeywordName() {
        return keywordName;
    }

    public void setKeywordName(String keywordName) {
        this.keywordName = keywordName;
    }

    public String getAudioFilePath() {
        return audioFilePath;
    }

    public void setAudioFilePath(String audioFilePath) {
        this.audioFilePath = audioFilePath;
    }
}