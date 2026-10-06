import React from "react";
import {
  ArrowUpRight,
  Brain,
  ScanLine,
  Sparkles,
  FileText,
  Activity,
  ShieldCheck,
} from "lucide-react";

interface LandingViewProps {
  onEnter: () => void;
}

const LandingView: React.FC<LandingViewProps> = ({ onEnter }) => {
  return (
    <div className="clinical-page">

      {/* =====================================================
          NAVIGATION
      ===================================================== */}
      <header className="clinical-nav">

        <button
          className="clinical-logo"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
        >
          <span className="clinical-logo-mark">
            <Brain size={18} strokeWidth={1.7} />
          </span>

          <span className="clinical-logo-text">
            NeuroScan
            <small>AI</small>
          </span>
        </button>

        <nav className="clinical-nav-links">
          <a href="#technology">Technology</a>
          <a href="#workflow">Workflow</a>
          <a href="#intelligence">Intelligence</a>
        </nav>

        <button
          className="clinical-login"
          onClick={onEnter}
        >
          Enter workspace
          <ArrowUpRight size={15} />
        </button>

      </header>


      {/* =====================================================
          HERO
      ===================================================== */}
      <main>

        <section className="clinical-hero">

          {/* LEFT */}
          <div className="clinical-hero-content">

            <div className="clinical-status">
              <span className="clinical-status-dot" />
              AI-ASSISTED MRI WORKSPACE
            </div>

            <h1>
              Intelligent
              <br />
              <span>brain imaging.</span>
            </h1>

            <p className="clinical-hero-text">
              A focused AI workspace for exploring brain MRI
              studies, generating imaging insights, and
              creating structured reports.
            </p>

            <div className="clinical-actions">

              <button
                className="clinical-primary"
                onClick={onEnter}
              >
                Analyze a scan
                <ArrowUpRight size={17} />
              </button>

              <a
                href="#technology"
                className="clinical-learn"
              >
                Explore technology
                <span>↓</span>
              </a>

            </div>

            <div className="clinical-mini-stats">

              <div>
                <strong>01</strong>
                <span>MRI ANALYSIS</span>
              </div>

              <div>
                <strong>02</strong>
                <span>AI INSIGHTS</span>
              </div>

              <div>
                <strong>03</strong>
                <span>REPORTING</span>
              </div>

            </div>

          </div>


          {/* RIGHT MRI PANEL */}
          <div className="clinical-visual">

            <div className="clinical-visual-top">

              <span>
                STUDY / NS-2048
              </span>

              <span className="clinical-live">
                <i />
                READY
              </span>

            </div>


            <div className="clinical-mri">

              <img
                src="/hero-image.jpg"
                alt="Brain MRI analysis"
              />

              <div className="clinical-mri-shade" />

              {/* crosshair */}
              <div className="clinical-crosshair">
                <div />
                <div />
              </div>

              {/* scan marker */}
              <div className="clinical-scan-marker">
                <span />
                <label>
                  REGION OF INTEREST
                </label>
              </div>

              {/* top metadata */}
              <div className="clinical-image-meta">
                <span>AXIAL</span>
                <span>T1 / T2</span>
                <span>01 / 24</span>
              </div>

              {/* bottom metadata */}
              <div className="clinical-image-bottom">
                <span>
                  BRAIN / MRI
                </span>

                <span>
                  256 × 256
                </span>
              </div>

            </div>


            {/* Floating AI panel */}
            <div className="clinical-ai-panel">

              <div className="clinical-ai-header">
                <div>
                  <span className="clinical-ai-icon">
                    <Sparkles size={13} />
                  </span>

                  <div>
                    <strong>AI ANALYSIS</strong>
                    <small>ASSISTED REVIEW</small>
                  </div>
                </div>

                <span className="clinical-ai-active">
                  ACTIVE
                </span>
              </div>

              <div className="clinical-ai-divider" />

              <div className="clinical-ai-row">
                <span>IMAGE QUALITY</span>
                <strong>GOOD</strong>
              </div>

              <div className="clinical-ai-row">
                <span>ANALYSIS STATUS</span>
                <strong>READY</strong>
              </div>

              <div className="clinical-ai-row">
                <span>EXPLAINABILITY</span>
                <strong>AVAILABLE</strong>
              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            TRUST / TECHNOLOGY BAR
        ===================================================== */}
        <section className="clinical-techbar">

          <div className="clinical-tech-title">
            POWERED BY
          </div>

          <div className="clinical-tech-item">
            <ScanLine size={16} />
            MRI VISUALIZATION
          </div>

          <div className="clinical-tech-item">
            <Activity size={16} />
            AI ANALYSIS
          </div>

          <div className="clinical-tech-item">
            <Sparkles size={16} />
            EXPLAINABLE AI
          </div>

          <div className="clinical-tech-item">
            <FileText size={16} />
            STRUCTURED REPORTS
          </div>

        </section>


        {/* =====================================================
            TECHNOLOGY
        ===================================================== */}
        <section
          className="clinical-technology"
          id="technology"
        >

          <div className="clinical-section-head">

            <span className="clinical-section-number">
              01
            </span>

            <div>
              <span className="clinical-kicker">
                TECHNOLOGY
              </span>

              <h2>
                Built around
                <br />
                the scan.
              </h2>
            </div>

          </div>


          <div className="clinical-tech-grid">

            <article className="clinical-tech-card">

              <div className="clinical-card-icon">
                <ScanLine size={21} />
              </div>

              <span className="clinical-card-number">
                01
              </span>

              <h3>
                Visualize
              </h3>

              <p>
                Review brain MRI imagery inside a focused
                visualization environment designed for
                detailed image exploration.
              </p>

              <span className="clinical-card-arrow">
                ↗
              </span>

            </article>


            <article className="clinical-tech-card">

              <div className="clinical-card-icon">
                <Sparkles size={21} />
              </div>

              <span className="clinical-card-number">
                02
              </span>

              <h3>
                Analyze
              </h3>

              <p>
                Use AI-assisted analysis to organize imaging
                observations and surface relevant patterns.
              </p>

              <span className="clinical-card-arrow">
                ↗
              </span>

            </article>


            <article className="clinical-tech-card">

              <div className="clinical-card-icon">
                <FileText size={21} />
              </div>

              <span className="clinical-card-number">
                03
              </span>

              <h3>
                Report
              </h3>

              <p>
                Convert analysis into structured findings
                and clear reports for professional review.
              </p>

              <span className="clinical-card-arrow">
                ↗
              </span>

            </article>

          </div>

        </section>


        {/* =====================================================
            WORKFLOW
        ===================================================== */}
        <section
          className="clinical-workflow"
          id="workflow"
        >

          <div className="clinical-workflow-copy">

            <span className="clinical-kicker">
              WORKFLOW / 02
            </span>

            <h2>
              One scan.
              <br />
              One workflow.
            </h2>

            <p>
              NeuroScan connects image review, AI-assisted
              analysis, explainability, and reporting in a
              single workspace.
            </p>

            <button
              className="clinical-outline-button"
              onClick={onEnter}
            >
              Open workspace
              <ArrowUpRight size={16} />
            </button>

          </div>


          <div className="clinical-workflow-list">

            <div className="clinical-workflow-item">

              <span>01</span>

              <div>
                <strong>
                  Upload
                </strong>

                <p>
                  Add the MRI study to the analysis workspace.
                </p>
              </div>

              <ArrowUpRight size={17} />

            </div>


            <div className="clinical-workflow-item">

              <span>02</span>

              <div>
                <strong>
                  Analyze
                </strong>

                <p>
                  Process the image with AI-assisted analysis.
                </p>
              </div>

              <ArrowUpRight size={17} />

            </div>


            <div className="clinical-workflow-item">

              <span>03</span>

              <div>
                <strong>
                  Explain
                </strong>

                <p>
                  Explore supporting visual and textual insights.
                </p>
              </div>

              <ArrowUpRight size={17} />

            </div>


            <div className="clinical-workflow-item">

              <span>04</span>

              <div>
                <strong>
                  Report
                </strong>

                <p>
                  Generate a structured report for review.
                </p>
              </div>

              <ArrowUpRight size={17} />

            </div>

          </div>

        </section>


        {/* =====================================================
            INTELLIGENCE
        ===================================================== */}
        <section
          className="clinical-intelligence"
          id="intelligence"
        >

          <div className="clinical-intelligence-grid">

            <div className="clinical-intelligence-number">
              03
            </div>

            <div>

              <span className="clinical-kicker">
                INTELLIGENCE LAYER
              </span>

              <h2>
                See more.
                <br />
                Understand better.
              </h2>

              <p>
                Designed to make complex imaging information
                easier to explore, interpret, and communicate.
              </p>

            </div>

          </div>

        </section>


        {/* =====================================================
            FINAL CTA
        ===================================================== */}
        <section className="clinical-final">

          <div className="clinical-final-grid">

            <div>
              <span className="clinical-kicker">
                NEUROSCAN AI
              </span>

              <h2>
                Start with
                <br />
                the image.
              </h2>
            </div>

            <div className="clinical-final-right">

              <p>
                Enter the NeuroScan workspace and explore
                AI-assisted brain MRI analysis.
              </p>

              <button
                className="clinical-primary clinical-final-button"
                onClick={onEnter}
              >
                Enter workspace
                <ArrowUpRight size={17} />
              </button>

            </div>

          </div>

        </section>

      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="clinical-footer">

        <div className="clinical-footer-brand">

          <span className="clinical-logo-mark">
            <Brain size={14} />
          </span>

          <strong>
            NeuroScan AI
          </strong>

        </div>

        <span>
          AI-ASSISTED BRAIN MRI ANALYSIS
        </span>

        <span>
          2026
        </span>

      </footer>

    </div>
  );
};

export { LandingView };
export default LandingView;