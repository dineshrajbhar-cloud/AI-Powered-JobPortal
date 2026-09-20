# 🚀 AI-Powered Job Portal

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.x-brightgreen)
![Spring Security](https://img.shields.io/badge/Spring_Security-JWT-success)
![React](https://img.shields.io/badge/React-18-blue)
![Python](https://img.shields.io/badge/Python-3.x-yellow)
![FastAPI](https://img.shields.io/badge/FastAPI-API-009688)
![Groq AI](https://img.shields.io/badge/Groq-AI-orange)
![MySQL](https://img.shields.io/badge/MySQL-Database-blue)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

> A full-stack AI-powered job portal that connects candidates and recruiters with intelligent resume analysis and AI-based job matching.

---

## 📌 Overview

**AI-Powered Job Portal** is a full-stack recruitment platform built using **Spring Boot, React, FastAPI and Groq AI**.

The platform provides separate workflows for **Candidates** and **Recruiters**, including job management, job applications, resume handling, application tracking and dashboards.

The application also integrates an **AI-powered Resume Job Matcher** that analyzes a candidate's resume and compares it with available job postings to generate:

- Match percentage
- Matching job details
- AI-generated matching reason
- Suitable job recommendations

The project follows a service-oriented architecture where the main backend is developed using Spring Boot and the AI service is developed using Python and FastAPI.

---

# ✨ Key Features

## 🔐 Authentication & Security

- User Registration
- User Login
- JWT Authentication
- BCrypt Password Encryption
- Role-Based Authorization
- Candidate & Recruiter Roles
- Protected REST APIs
- Stateless Authentication

---

## 👤 Candidate Features

- Candidate Registration & Login
- Browse Jobs
- Search Jobs
- Filter Jobs
- View Job Details
- Apply for Jobs
- Upload Resume
- Track Applications
- View Application Status
- Candidate Dashboard
- AI Resume Job Matching
- AI Match Percentage
- AI Match Explanation

---

## 💼 Recruiter Features

- Recruiter Registration & Login
- Recruiter Dashboard
- Create Jobs
- Update Jobs
- Delete Jobs
- Manage Job Postings
- View Applicants
- Update Application Status
- Application Management
- Email Notifications

---

# 🤖 AI Features

The project includes a separate AI microservice built using **Python + FastAPI**.

### AI Resume Analysis

The AI service extracts text from uploaded PDF resumes and analyzes:

- Professional Summary
- Technical Skills
- Education
- Projects
- Experience
- Strengths
- Recommended Skills

### AI Job Matching

The AI service:

1. Receives the candidate's resume.
2. Extracts resume text.
3. Fetches available jobs from Spring Boot.
4. Sends resume and job data to Groq AI.
5. Analyzes compatibility.
6. Returns structured JSON results.

Example:

```json
{
  "matchedJobs": [
    {
      "jobId": 1,
      "title": "Java Backend Developer",
      "company": "Test Company",
      "location": "Bangalore",
      "salary": 800000,
      "matchPercentage": 92,
      "reason": "Strong Java, Spring Boot, REST API and backend development experience."
    }
  ]
}

System Architecture

                         ┌─────────────────────┐
                         │      React UI        │
                         │   Frontend :5173     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    Spring Boot      │
                         │    Backend :9090     │
                         └──────────┬──────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
                 ▼                  ▼                  ▼
          ┌─────────────┐   ┌──────────────┐   ┌─────────────┐
          │    MySQL    │   │ JWT Security │   │   Swagger   │
          └─────────────┘   └──────────────┘   └─────────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    FastAPI AI       │
                         │    Service :8000    │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      Groq AI        │
                         └─────────────────────┘

📂 Project Structure

jobportal/
│
├── src/
│   └── main/
│       └── java/
│           └── com/dinesh/jobportal/
│               ├── config/
│               ├── controller/
│               ├── dto/
│               ├── entity/
│               ├── exception/
│               ├── repositories/
│               ├── security/
│               ├── service/
│               └── serviceImpl/
│
├── ai-service/
│   ├── main.py
│   ├── groq_service.py
│   ├── job_service.py
│   ├── models.py
│   ├── requirements.txt
│   └── venv/
│
├── jobportal-frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── pom.xml
└── README.md

🔄 AI Job Matching Flow

Candidate
    │
    │ Upload Resume
    ▼
React Frontend
    │
    ▼
Spring Boot
    │
    │ Multipart Request
    ▼
FastAPI AI Service
    │
    ├── Extract Resume Text
    │
    ├── Fetch Available Jobs
    │
    ▼
Groq AI
    │
    │ Analyze & Match
    ▼
Structured JSON Response
    │
    ▼
Spring Boot
    │
    ▼
React Frontend
    │
    ▼
Match Percentage + Reason

🔐 Authentication Flow

User Login
    │
    ▼
Spring Security
    │
    ▼
User Authentication
    │
    ▼
JWT Generated
    │
    ▼
Authentication Cookie
    │
    ▼
JWT Authentication Filter
    │
    ▼
Protected REST API

🛠 Tech Stack

# 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| Java 17 | Backend Development |
| Spring Boot 4.x | REST API Development |
| Spring Security | Authentication & Authorization |
| JWT | Secure Authentication |
| Spring Data JPA | Database Access |
| Hibernate | ORM |
| MySQL | Relational Database |
| Maven | Build & Dependency Management |
| Swagger / OpenAPI | API Documentation |
| React | Frontend Development |
| JavaScript | Frontend Logic |
| FastAPI | AI Microservice |
| Python | AI Service |
| Groq AI | AI Processing |
| PyPDF | Resume PDF Extraction |
| Axios | Frontend API Communication |
| Tailwind CSS | Frontend Styling |

🗄 Database

# 🗄 Database

The application uses **MySQL** as the relational database with **Spring Data JPA** and **Hibernate** for database interaction.

## User

| Field | Type |
|------|------|
| id | Long |
| name | String |
| email | String |
| password | String |
| role | Enum |

## Job

| Field | Type |
|------|------|
| id | Long |
| title | String |
| description | String |
| company | String |
| location | String |
| salary | Double |
| createdAt | LocalDateTime |

## Application

| Field | Type |
|------|------|
| id | Long |
| status | String |
| appliedAt | LocalDateTime |
| user | ManyToOne |
| job | ManyToOne |
| resumePath | String |

👨‍💻 Author

# 👨‍💻 Author

**Dinesh Rajbhar**

Java Backend / Full-Stack Developer

### GitHub

https://github.com/dineshrajbhar-cloud

### LinkedIn

https://www.linkedin.com/in/dineshrajbharjavadeveloper
