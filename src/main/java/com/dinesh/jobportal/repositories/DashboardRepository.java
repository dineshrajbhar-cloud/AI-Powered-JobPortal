package com.dinesh.jobportal.repositories;

import com.dinesh.jobportal.entity.Application;
import com.dinesh.jobportal.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DashboardRepository extends JpaRepository<Application, Long> {

    long countByStatus(String status);
}
