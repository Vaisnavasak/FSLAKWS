package com.fslakws.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import com.fslakws.backend.entity.TargetAudio;

@Repository
public interface TargetAudioRepository extends JpaRepository<TargetAudio, Integer> {
    List<TargetAudio> findByUserUserId(Integer userId);
}