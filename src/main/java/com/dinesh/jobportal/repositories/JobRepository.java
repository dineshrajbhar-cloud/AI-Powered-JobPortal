package com.dinesh.jobportal.repositories;

import com.dinesh.jobportal.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job,Long> {

    List<Job> findByTitleContainingIgnoreCase(String title);

    List<Job> findByLocationContainingIgnoreCase(String location);

    List<Job> findByCompanyContainingIgnoreCase(String company);

    List<Job> findBySalaryBetween(Double minSalary, Double maxSalary);

}
