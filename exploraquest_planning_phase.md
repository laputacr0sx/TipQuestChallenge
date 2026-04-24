# ExploraQuest — Planning Phase Document

## Document Control
- **Project Name:** ExploraQuest
- **Document Type:** Concise Planning Phase Document
- **Version:** 1.0
- **Status:** Approved for Pre-Implementation Planning
- **Prepared For:** Demo app planning and alignment before technical implementation
- **Prepared On:** 2026-04-23

## 1. Executive Summary
ExploraQuest is a mobile-first, AI-powered educational demo application designed for Hong Kong primary school students participating in school-organized visits, site-seeing activities, and experiential learning trips.

The product is structured around the three common activity phases:
- **Pre-Trip**
- **During Trip**
- **Post Trip**

The purpose of the product is not merely to digitize worksheets. It is to improve educational effectiveness by increasing students' motivation to learn, while reducing teachers' tedious administrative work so they can focus more on observation, guidance, and student development.

For students, the experience should feel like a light **exploration game**.
For teachers, the experience should feel like a simple **orchestration and review tool**.

This document captures the agreed planning decisions before moving into technical implementation planning.

## 2. Business Context
Hong Kong students in upper primary levels often participate in school-hosted visits and experiential learning activities. These visits usually contain three natural phases:
1. **Pre-Trip** — preparation before the visit
2. **During Trip** — guided participation on-site
3. **Post Trip** — reflection and follow-up after the visit

In current practice, these trips often suffer from several issues:
- student participation may be passive rather than self-initiated
- preparation may be shallow or inconsistent
- on-site learning may lack structure
- post-trip reflection may be repetitive or weak
- teachers may spend too much time on administrative coordination and manual follow-up

This creates an opportunity for a focused educational product that enhances both student and teacher experience across all three phases.

## 3. Product Vision
### Vision Statement
To create a mobile-first educational companion that transforms school field trips into structured, motivating, AI-assisted exploration journeys.

### Product Positioning
ExploraQuest is an **AI-assisted field trip learning companion**.
It is not a full learning management system, not a school admin system, and not only a trip management tool.

### Experience Principle
- **For students:** exploration game vibe, curiosity-driven, simple and visual
- **For teachers:** lightweight planning, low-friction review, reduced admin burden

## 4. Core Goals
### 4.1 Student Goals
The product should:
- motivate students' learning initiative
- increase curiosity and active participation
- encourage observation, discovery, and simple reflection
- make learning feel engaging rather than burdensome

### 4.2 Teacher Goals
The product should:
- reduce tedious administrative burden
- reduce repetitive setup and manual collection of student outputs
- help teachers focus on student behavior, guidance, and learning progress
- provide simple visibility into participation and outcomes

### 4.3 Demo Goals
As a demo app, the product should:
- show a coherent end-to-end learning flow
- demonstrate meaningful AI usage
- be usable on mobile browser
- be deployable as a live, browser-based demo instead of localhost-only

## 5. Success Criteria
The demo should be considered successful if it can clearly demonstrate that:
- students can understand and complete guided missions on mobile
- students receive immediate, age-appropriate AI support
- teachers can set up and review activity results with minimal friction
- the app supports all three phases in one coherent flow
- the app feels purposeful for both student and teacher users

## 6. Target Users
### 6.1 Primary User Group: Students
- **Age Range:** approximately 8–10 years old
- **School Context:** primary school students joining school-organized trips
- **Key Needs:**
  - simple interactions
  - visual-first design
  - minimal typing
  - quick feedback
  - visible sense of progress and achievement

### 6.2 Primary User Group: Teachers
- **Context:** teachers planning, guiding, and reviewing learning activities
- **Key Needs:**
  - quick trip setup
  - low-friction mission preparation
  - simple overview of student participation
  - reduced manual review burden
  - ability to focus on behavior observation and guidance

## 7. Core Product Problem
Schools need a better way to turn field trips into meaningful and motivating learning experiences without increasing teachers' workload.

ExploraQuest addresses this by combining:
- structured exploration flow
- student-facing mission-based interaction
- AI-generated encouragement and support
- teacher-facing review and orchestration features

## 8. Product Strategy
### 8.1 Strategic Design Choice
The product will be designed around the three natural phases of school field trips:
- Pre-Trip
- During Trip
- Post Trip

This is the correct organizing model because it matches the real-world operational flow already familiar to schools and teachers.

### 8.2 Student Motivation Strategy
Traditional education interfaces often fail to motivate young learners because they overemphasize passive reading, quizzes, and text-heavy tasks.

ExploraQuest will instead use:
- mission-based exploration
- simple visual progress
- instant AI encouragement
- light achievement feeling

This approach better supports intrinsic motivation and self-initiated participation.

### 8.3 Teacher Value Strategy
Teachers are not secondary afterthought users. They are a core user group.

The product must reduce teacher workload rather than create a new digital burden. Therefore, teacher workflow must be kept simple and practical.

## 9. Product Design Principles
### For Students
- minimal typing
- image-first interaction
- large touch-friendly actions
- encouraging language
- visible progress and completion
- short attention-friendly flows

### For Teachers
- quick setup
- low-friction mission creation
- minimal manual administration
- clear class overview
- easy access to submissions and summaries

### For the Overall Product
- one polished end-to-end journey is better than many shallow features
- AI should act as a guide, not a grader
- every feature must serve either motivation, teacher efficiency, or both

## 10. Essential User Journeys
### 10.1 Student Journey
1. Join or access a trip on mobile
2. See a short trip intro and mission list
3. Select a mission during the trip
4. Submit evidence using a photo
5. Receive AI feedback in simple, encouraging language
6. View a post-trip exploration summary or story

### 10.2 Teacher Journey
1. Create a trip
2. Enter trip topic or destination
3. Let AI generate missions and activity prompts
4. Monitor student participation status
5. Review student outputs and AI-assisted summaries
6. Use outputs for follow-up teaching or discussion

## 11. Functional Scope — MVP
The MVP should cover one complete and demoable end-to-end flow.

### 11.1 Pre-Trip
#### Feature: Trip Intro
- Present a short, friendly introduction to the trip
- Frame the activity as an exploration experience

#### Feature: Mission Preview
- Show a small set of missions before the visit
- Missions should be action-based and simple to understand

### 11.2 During Trip
#### Feature: Mission Selection
- Students can choose a mission from a list

#### Feature: Photo Submission
- Students submit a photo as evidence of discovery or participation

#### Feature: AI Guide Response
- AI analyzes the submission context
- AI responds with:
  - a short encouraging message
  - a simple explanation or observation
  - an optional follow-up curiosity prompt

### 11.3 Post Trip
#### Feature: Exploration Story
- Generate a concise summary of what the student completed
- Reinforce achievement and learning highlights

### 11.4 Teacher Side
#### Feature: Trip Setup
- Teacher creates a trip and enters a destination/topic

#### Feature: AI Mission Generation
- Teacher does not need to manually write all missions
- AI should assist by generating mission suggestions based on trip context

#### Feature: Review Dashboard
- Teacher sees student completion status and outputs
- Teacher can quickly review submissions without manual collection

## 12. Key Product Decisions Already Agreed
### 12.1 Experience Direction
**Decision:** The product should have an exploration game vibe.

**Reason:** This better matches the student motivation goal while remaining suitable for educational use.

### 12.2 AI Role
**Decision:** AI should act as an encouraging guide and assistant, not as a strict grader.

**Reason:** Young learners respond better to encouragement and curiosity prompts than to correction-heavy flows.

### 12.3 Handling Imperfect Student Submissions
**Decision:** If a student submits something incorrect or off-target, the system should still respond in a motivating way rather than hard-rejecting the attempt.

**Reason:** Maintaining engagement and flow is more valuable in this demo than strict validation. The system should gently guide rather than punish.

### 12.4 Mission Authoring
**Decision:** Teachers should be able to provide the trip topic or destination, and AI should generate mission suggestions.

**Reason:** This strongly supports the teacher efficiency objective and creates a stronger business demo story.

### 12.5 Login Simplicity
**Decision:** Use simple student access such as name-based entry and trip code instead of full complex authentication.

**Reason:** This reduces friction for students, keeps the demo realistic, and avoids unnecessary implementation overhead.

## 13. Scope Control
### 13.1 In Scope
- mobile-friendly browser-based experience
- student mission flow
- photo-based submission
- AI-generated mission support
- AI-generated student feedback
- student post-trip summary/story
- teacher trip setup
- teacher review dashboard
- live deployed demo target

### 13.2 Out of Scope
The following should not be included in the MVP:
- full school management functionality
- advanced authentication flows
- parent portal
- chat system
- complex grading or rubric engine
- live GPS or real-time student location tracking
- advanced analytics dashboard
- multi-school or enterprise administration
- offline synchronization complexity
- video recording workflows

### 13.3 Rationale for Scope Discipline
This is a tiny demo project. The objective is not feature quantity. The objective is to show a focused, convincing, usable product with strong business alignment.

## 14. Trade-Off Register
### Trade-Off 1: Educational Rigor vs Student Motivation
- **Chosen Direction:** favor student motivation with gentle guidance
- **Reason:** for the target age group and demo context, motivation and participation are more important than strict correctness enforcement

### Trade-Off 2: Rich Feature Set vs Delivery Quality
- **Chosen Direction:** fewer features, more polish
- **Reason:** one coherent and stable flow is more convincing than many incomplete features

### Trade-Off 3: Full Teacher Control vs AI Assistance
- **Chosen Direction:** AI-assisted mission generation
- **Reason:** reduces teacher setup burden and strengthens the value proposition

### Trade-Off 4: Strong Authentication vs Ease of Access
- **Chosen Direction:** simple student access model
- **Reason:** lowers friction and avoids wasting effort on non-core features

## 15. Assumptions
- students will use mobile browsers during the demo flow
- teacher users will accept a simplified dashboard in MVP
- AI output can be constrained to child-friendly tone
- the live demo is more important than production-level operational depth
- a browser-based deployable web app is acceptable for the challenge requirements

## 16. Constraints
- must be demoable as a live deployed app
- must be usable in browser
- should support mobile interaction
- should remain concise and realistic for a short project cycle
- should demonstrate AI meaningfully rather than superficially

## 17. Delivery Positioning
This product should be presented as a **usable educational demo prototype** that demonstrates how AI can improve both student motivation and teacher workflow across the full lifecycle of a school field trip.

The value of the demo is not only in its UI, but in its product reasoning:
- correct user targeting
- clear educational flow
- rational scope control
- meaningful AI integration
- balanced support for students and teachers

## 18. Deferred for Next Planning Phase
The following topics are intentionally deferred to the next planning document set:
- technical architecture
- data model design
- API design
- AI workflow details
- implementation roadmap
- testing and deployment plan

These should be documented separately to preserve alignment between product planning and technical planning.

## 19. Final Planning Conclusion
ExploraQuest should proceed as a concise, mobile-first, AI-assisted field trip learning demo that:
- supports Pre-Trip, During Trip, and Post Trip phases
- motivates students through exploration-style interaction
- reduces teacher administrative burden through AI assistance and simple review flows
- prioritizes usability, coherence, and demo readiness over breadth of features

This document serves as the agreed product planning baseline before entering technical implementation planning.
