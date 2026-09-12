package com.dinesh.jobportal.repositories;

import com.dinesh.jobportal.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application,Long> {

    List<Application> findByUserId(Long userId);

    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, String status);

}
