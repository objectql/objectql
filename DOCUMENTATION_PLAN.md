# Documentation Optimization Plan

## 🎯 Goal
Restructure the documentation to follow the **Diataxis Framework** (Tutorials, Guides, Reference, Explanation) to make it more accessible and attractive to new developers.

## 🏗 Structural Changes

### 1. New Top-Level Section: `Tutorials` (Learning-oriented)
Essential for onboarding. `Quick Start` is good, but developers need a "Step-by-Step" journey.
- **Location**: `docs/tutorials/`
- **Content**:
  - `build-your-first-app.md`: A complete Todo List or Blog implementation.
  - `building-crm.md`: Handling relationships and permissions.

### 2. Refine `Guide` -> `How-to Guides` (Task-oriented)
Focus on solving specific problems.
- Move "Core Fundamentals" to focus on *tasks* (e.g., "How to define a schema", "How to query specific fields").
- Rename broad titles to actionable ones.

### 3. Highlight `Concepts` (Understanding-oriented)
Create a clear distinction between "How do I do X?" and "How does X work?".
- **New Section in Guide**: `Architecture & Concepts`
  - `why-objectql.md`: Deep dive into the "Why".
  - `federation-architecture.md`: Visual diagrams of how federation works.

### 4. Optimize Homepage (`docs/index.md`)
- Add a "Code Block" Hero section: Show YAML Input -> SQL/API Output immediately.
- Add "Use Cases" section.

## 📅 Execution Steps

### Step 1: Add Tutorials Section
- [x] Create directory `docs/tutorials`
- [x] Create `docs/tutorials/index.md` placeholder
- [x] Update `docs/.vitepress/config.mts` to include "Tutorials" in Nav and Sidebar.

### Step 2: Content Injection
- [ ] Write `build-your-first-app.md` content.

### Step 3: Visual Polish
- [ ] Add diagrams to `guide/architecture.md`.
