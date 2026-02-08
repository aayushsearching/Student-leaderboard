import React from 'react';
import './HowItWorks.css';

function HowItWorks() {
  return (
    <div className="how-it-works-container">
      <h1 className="how-it-works-title">How MentorFlow Works</h1>
      <p className="how-it-works-intro">
        MentorFlow connects senior students with first-year students through a task-based learning system,
        helping juniors gain practical skills relevant to current industry trends.
      </p>

      <div className="steps-grid-container">
        <div className="step-card">
          <h2>Step 1: Seniors Assign Tasks</h2>
          <p>Experienced 3rd and 4th-year students (Seniors) create and assign learning tasks to first-year students (Juniors).</p>
          <ul>
            <li>Tasks are designed to be relevant to current market trends and technologies.</li>
            <li>Seniors define the learning objectives and resources for each task.</li>
          </ul>
        </div>

        <div className="step-card">
          <h2>Step 2: Juniors Learn & Quiz Up</h2>
          <p>Juniors accept a task and begin their learning journey:</p>
          <ul>
            <li><strong>Course Material:</strong> Access curated learning resources, such as YouTube videos, articles, and documentation, provided by the Seniors.</li>
            <li><strong>Quiz Challenge:</strong> After reviewing the course material, Juniors must pass a short quiz to demonstrate their understanding.</li>
            <li><strong>70% Pass Mark:</strong> A minimum score of 70% is required on the quiz to unlock the practical task. This ensures a solid foundational understanding.</li>
          </ul>
        </div>

        <div className="step-card">
          <h2>Step 3: Complete the Practical Task</h2>
          <p>Once the quiz is passed, Juniors proceed to the practical task:</p>
          <ul>
            <li>Tasks range in difficulty, with points awarded accordingly: <strong>Easiest (3-5 points), Hardest (20 points)</strong>.</li>
            <li>Juniors complete the practical assignment and prepare their proof of completion (e.g., code repository link, demo video, project screenshots).</li>
            <li>Proof is submitted through the platform.</li>
          </ul>
        </div>

        <div className="step-card">
          <h2>Step 4: Senior Review & Points</h2>
          <p>Seniors review the submitted practical tasks:</p>
          <ul>
            <li>Seniors verify that the task has been completed accurately and to the required standard.</li>
            <li>Upon successful completion, the task is marked as complete, and the Junior automatically receives the allocated points in their account.</li>
          </ul>
        </div>

        <div className="step-card">
          <h2>Step 5: Rise on the Leaderboard</h2>
          <p>Points earned contribute to a Junior's overall rank:</p>
          <ul>
            <li>The Leaderboard displays the ranks of all Juniors based on their total accumulated points.</li>
            <li>Juniors can track their progress, compete with peers, and see their efforts recognized!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default HowItWorks;
