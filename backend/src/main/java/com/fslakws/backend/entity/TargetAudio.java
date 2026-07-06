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
@Table(name = "Target_Audio")
public class TargetAudio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "audio_id")
    private Integer audioId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "target_name", nullable = false, length = 100)
    private String targetName;

    public TargetAudio() {
    }

    public TargetAudio(User user, String targetName) {
        this.user = user;
        this.targetName = targetName;
    }

    public Integer getAudioId() {
        return audioId;
    }

    public void setAudioId(Integer audioId) {
        this.audioId = audioId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getTargetName() {
        return targetName;
    }

    public void setTargetName(String targetName) {
        this.targetName = targetName;
    }
}