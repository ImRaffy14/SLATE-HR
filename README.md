# SLATE-HR System User Guide

## Complete Documentation for Students and End Users

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Overview](#2-system-overview)
3. [End-to-End Process](#3-end-to-end-process)
4. [Module 1: Employee Self-Service (ESS)](#4-module-1-employee-self-service-ess)
5. [Module 2: Learning Management](#5-module-2-learning-management)
6. [Module 3: Training Management](#6-module-3-training-management)
7. [Module 4: Competency Management](#7-module-4-competency-management)
8. [Module 5: Performance Management](#8-module-5-performance-management)
9. [Module 6: Succession Planning](#9-module-6-succession-planning)
10. [Module 7: Admin Dashboard](#10-module-7-admin-dashboard)
11. [Quick Reference Guide](#11-quick-reference-guide)
12. [Appendix: System Flow Diagrams](#12-appendix-system-flow-diagrams)

---

## 1. Introduction

### What is SLATE-HR?

SLATE-HR is an integrated Human Resources system designed to manage employees, learning, training, competencies, performance, and succession planning in one unified platform.

### Who Uses This System?

* **Employees** – Learn, attend trainings, upload achievements, and track career growth.
* **Managers** – Review performance, give feedback, and develop team members.
* **HR Administrators** – Configure the system, manage learning, competencies, and plan future leadership.

### Why This System Exists

* Reduce paperwork and manual HR processes
* Connect learning, training, and performance data
* Identify and develop future leaders
* Support data-driven HR decisions

---

## 2. System Overview

### System Architecture Diagram

```mermaid
flowchart TB
    subgraph Users
        Employee
        Manager
        HR_Admin[HR Admin]
    end

    subgraph Portal[SLATE-HR Portal]
        ESS[Employee Self-Service]
        AdminPanel[Admin Panel]
    end

    subgraph Modules
        Learning
        Training
        Competency
        Performance
        Succession
        Dashboard
    end

    Employee --> ESS
    Manager --> ESS
    Manager --> AdminPanel
    HR_Admin --> AdminPanel

    ESS --> Learning
    ESS --> Training
    ESS --> Performance

    AdminPanel --> Learning
    AdminPanel --> Training
    AdminPanel --> Competency
    AdminPanel --> Performance
    AdminPanel --> Succession
    AdminPanel --> Dashboard

    Learning --> Competency
    Training --> Competency
    Competency --> Performance
    Performance --> Succession
```

### Key Features at a Glance

| Feature                | Description                       | Users               |
| ---------------------- | --------------------------------- | ------------------- |
| Employee Self-Service  | Personal employee portal          | Employees           |
| Learning Management    | Online courses & e-learning       | Employees, HR       |
| Training Management    | Live trainings with QR attendance | Employees, HR       |
| Competency Management  | Skill and capability tracking     | HR, Managers        |
| Performance Management | Reviews and feedback              | Managers, Employees |
| Succession Planning    | Leadership pipeline planning      | HR, Leadership      |
| Admin Dashboard        | Analytics & system overview       | HR, Management      |

---

## 3. End-to-End Process

### Complete Employee Journey

```mermaid
flowchart TD
    A[Employee Joins Company] --> B[HR Creates Employee Record]
    B --> C[Employee Gets ESS Access]
    C --> D[Employee Logs In]

    D --> E[Dashboard]
    E --> F{Employee Action}

    F -->|Learn| G[Enroll in Course]
    F -->|Train| H[Enroll in Training]
    F -->|Grow| I[View Career Path]

    G --> J[Complete Course]
    J --> K[Certificate Issued]

    H --> L[Attend Training]
    L --> M[Scan QR Code]

    K --> N[Competency Updated]
    M --> N

    N --> O[Performance Review]
    O --> P{Talent Pool?}

    P -->|Yes| Q[Create IDP]
    P -->|No| G

    Q --> R[Track Progress]
    R --> S{Ready?}
    S -->|Yes| T[Promotion Considered]
    S -->|No| G
```

---

## 4. Module 1: Employee Self-Service (ESS)

### ESS Structure

```mermaid
flowchart LR
    ESS --> Dashboard
    ESS --> CareerPath[Career Path]
    ESS --> LearningTab[Learning]
    ESS --> TrainingTab[Trainings]
    ESS --> Achievements
    ESS --> Notifications
```

### Key Capabilities

* View dashboard summary and calendar
* Enroll in courses and trainings
* Scan QR codes for attendance
* Upload achievements
* Track career growth and performance

---

## 5. Module 2: Learning Management

### Learning Flow

```mermaid
flowchart TD
    HR[HR Creates Course] --> Materials
    Materials --> Quiz
    Quiz --> Publish

    Publish --> Enroll
    Enroll --> Study
    Study --> TakeQuiz
    TakeQuiz --> Pass{Passed?}

    Pass -->|Yes| Complete
    Pass -->|No| TakeQuiz

    Complete --> Certificate
    Certificate --> CompetencyUpdate[Competency Updated]
```

---

## 6. Module 3: Training Management

### Training Flow

```mermaid
flowchart TD
    HR --> CreateTraining
    CreateTraining --> Schedule
    Schedule --> Publish

    Publish --> Enroll
    Enroll --> TrainingDay
    TrainingDay --> QRCode
    QRCode --> Scan
    Scan --> AttendanceMarked
```

---

## 7. Module 4: Competency Management

### Competency Lifecycle

```mermaid
flowchart TD
    Define[Define Competencies] --> LinkRoles
    LinkRoles --> Assess
    Assess --> Scores
    Scores --> GapAnalysis
    GapAnalysis --> RecommendLearning
```

---

## 8. Module 5: Performance Management

### Performance Review Flow

```mermaid
flowchart TD
    Work --> DataCollection
    DataCollection --> ManagerReview
    ManagerReview --> Rating
    Rating --> Feedback
    Feedback --> EmployeeView
```

---

## 9. Module 6: Succession Planning

### Succession Planning Flow

```mermaid
flowchart TD
    CriticalRoles --> TalentPool
    TalentPool --> Evaluate
    Evaluate --> Readiness
    Readiness --> IDP
    IDP --> Learning
    Learning --> ReadyNow[Ready for Promotion]
```

---

## 10. Module 7: Admin Dashboard

### Dashboard Overview

```mermaid
flowchart TD
    Dashboard --> KPIs
    Dashboard --> Charts
    Dashboard --> ActivityLog
```

---

## 11. Quick Reference Guide

### Employees

| Task               | Location           |
| ------------------ | ------------------ |
| Enroll in course   | ESS → Learning     |
| Attend training    | ESS → Trainings    |
| Upload achievement | ESS → Achievements |
| View career path   | ESS → Career Path  |

### HR / Admin

| Task                | Location           |
| ------------------- | ------------------ |
| Create course       | Admin → Learning   |
| Create training     | Admin → Training   |
| Define competencies | Admin → Competency |
| Manage succession   | Admin → Succession |

---

## 12. Appendix: Automation Flow

### IDP Progress Automation

```mermaid
flowchart TD
    IDP --> Goals
    Goals --> Learning
    Learning --> AutoUpdate
    AutoUpdate --> ReadyCheck{Ready?}
    ReadyCheck -->|Yes| Promotion
    ReadyCheck -->|No| Learning
```

---

**Document Version:** 1.0
**Audience:** Students and End Users
**Format:** Markdown (.md)
