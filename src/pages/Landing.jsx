import { Container, Row, Col } from 'react-bootstrap';
import {
  FaChartLine,
  FaPalette,
  FaRobot,
  FaCheckCircle,
  FaArrowRight,
} from 'react-icons/fa';
import './Landing.css';

export default function Landing() {
  const features = [
    {
      id: 1,
      icon: <FaChartLine />,
      title: "Interactive Profile",
      description: "Create a living portfolio that showcases your work, skills, and personality. Stand out from traditional resumes.",
    },
    {
      id: 2,
      icon: <FaPalette />,
      title: "Beautiful Templates",
      description: "Choose from professionally designed templates. Customize colors, fonts, and layouts to match your personal brand.",
    },
    {
      id: 3,
      icon: <FaRobot />,
      title: "Smart Job Matching",
      description: "AI-powered matching connects you with opportunities that fit your skills and career goals perfectly.",
    },
  ];

  const steps = [
    {
      id: 1,
      number: "01",
      title: "Create Profile",
      description: "Build your digital identity in minutes. Add your experience, skills, and portfolio items.",
    },
    {
      id: 2,
      number: "02",
      title: "Customize Design",
      description: "Choose a template and personalize it with your brand colors, fonts, and preferred layout.",
    },
    {
      id: 3,
      number: "03",
      title: "Get Matched & Land Jobs",
      description: "AI finds perfect job matches for you. Apply with one click and accelerate your career.",
    },
  ];

  const testimonials = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "Product Manager",
      avatar: "SC",
      text: "Smart Persona helped me stand out. I got 3 job offers within a month of creating my profile.",
    },
    {
      id: 2,
      name: "John Smith",
      role: "Software Engineer",
      avatar: "JS",
      text: "The AI matching is incredible. Found a role that perfectly aligns with my skills and interests.",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "UX Designer",
      avatar: "ER",
      text: "Templates are beautiful and easy to customize. Love the interactive portfolio feature.",
    },
  ];

  return (
    <div className="landing-page">
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="hero-section">
        <Container>
          <div className="hero-badge">Professional Career Platform</div>
          <h1 className="hero-title">
            Build Your Professional<br />Identity
          </h1>
          <p className="hero-subtitle">
            More than a resume. Create an interactive portfolio that showcases
            your skills, experience, and personality to land your dream job.
          </p>
          <div className="hero-buttons">
            <a href="/login" className="ds-btn-primary btn-hero-primary">
              Get Started Free <FaArrowRight />
            </a>
            <button
              className="ds-btn-secondary btn-hero-secondary"
              onClick={() =>
                document.getElementById('features').scrollIntoView({ behavior: 'smooth' })
              }
            >
              Learn More
            </button>
          </div>
          <p className="hero-social-proof">
            No credit card required &nbsp;&bull;&nbsp; Free forever plan &nbsp;&bull;&nbsp; Join 50,000+ professionals
          </p>
        </Container>
      </section>

      {/* ── Stats ─────────────────────────────────────────── */}
      <section className="stats-section">
        <Container>
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-number">50,000+</span>
              <span className="stat-label">Professionals</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">10,000+</span>
              <span className="stat-label">Jobs Posted</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">95%</span>
              <span className="stat-label">Success Rate</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">2–4 wks</span>
              <span className="stat-label">Avg. Time to Hire</span>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section id="features" className="features-section">
        <Container>
          <div className="ds-section-header">
            <span className="ds-section-label">Features</span>
            <h2 className="ds-section-title">Why Choose Smart Persona?</h2>
            <p className="ds-section-subtitle">
              Everything you need to showcase your professional story
            </p>
          </div>

          <Row className="g-4">
            {features.map((f) => (
              <Col lg={4} md={6} key={f.id}>
                <div className="feature-card ds-card">
                  <div className="ds-icon-box feature-icon">{f.icon}</div>
                  <h3 className="feature-title">{f.title}</h3>
                  <p className="feature-desc">{f.description}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ── How It Works ──────────────────────────────────── */}
      <section className="how-section">
        <Container>
          <div className="ds-section-header">
            <span className="ds-section-label">Process</span>
            <h2 className="ds-section-title">How It Works</h2>
            <p className="ds-section-subtitle">Get started in three simple steps</p>
          </div>

          <div className="steps-grid">
            {steps.map((step, idx) => (
              <div key={step.id} className="step-item">
                <div className="step-number">{step.number}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.description}</p>
                {idx < steps.length - 1 && <div className="step-connector" />}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Features List ─────────────────────────────────── */}
      <section className="features-list-section">
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={6}>
              <span className="ds-section-label">Everything included</span>
              <h2 className="ds-section-title text-start" style={{ marginBottom: 'var(--space-6)' }}>
                Packed with Powerful Features
              </h2>
              <ul className="features-list">
                {[
                  "Interactive portfolio builder",
                  "Professional templates",
                  "AI-powered job matching",
                  "One-click applications",
                  "Resume builder",
                  "Analytics dashboard",
                ].map((item) => (
                  <li key={item}>
                    <FaCheckCircle className="check-icon" />
                    {item}
                  </li>
                ))}
              </ul>
              <a href="/login" className="ds-btn-primary" style={{ marginTop: 'var(--space-8)' }}>
                Get Started Now <FaArrowRight />
              </a>
            </Col>

            <Col lg={6}>
              <div className="mockup-card">
                <div className="mockup-header">
                  <div className="mockup-dots">
                    <span /><span /><span />
                  </div>
                  <span className="mockup-title">Profile Preview</span>
                </div>
                <div className="mockup-body">
                  <div className="mockup-avatar">AJ</div>
                  <div className="mockup-info">
                    <p className="mockup-name">Alex Johnson</p>
                    <p className="mockup-role">Senior Developer</p>
                  </div>
                  <div className="mockup-tags">
                    <span className="ds-badge">React</span>
                    <span className="ds-badge">TypeScript</span>
                    <span className="ds-badge">8 yrs exp</span>
                  </div>
                  <div className="mockup-stat-row">
                    <div className="mockup-stat"><strong>12</strong><span>Projects</span></div>
                    <div className="mockup-stat"><strong>48</strong><span>Skills</span></div>
                    <div className="mockup-stat"><strong>4.9</strong><span>Rating</span></div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ── Testimonials ──────────────────────────────────── */}
      <section className="testimonials-section">
        <Container>
          <div className="ds-section-header">
            <span className="ds-section-label">Testimonials</span>
            <h2 className="ds-section-title">What Our Users Say</h2>
          </div>

          <Row className="g-4">
            {testimonials.map((t) => (
              <Col lg={4} md={6} key={t.id}>
                <div className="testimonial-card ds-card">
                  <p className="testimonial-text">"{t.text}"</p>
                  <div className="testimonial-author">
                    <div className="author-avatar">{t.avatar}</div>
                    <div>
                      <p className="author-name">{t.name}</p>
                      <p className="author-role">{t.role}</p>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ── FAQ ───────────────────────────────────────────── */}
      <section className="faq-section">
        <Container>
          <div className="ds-section-header">
            <span className="ds-section-label">FAQ</span>
            <h2 className="ds-section-title">Frequently Asked Questions</h2>
          </div>

          <div className="faq-grid">
            {[
              {
                q: "Is Smart Persona really free?",
                a: "Yes! Our free plan includes profile creation, job browsing, and 5 applications per month.",
              },
              {
                q: "How does AI matching work?",
                a: "Our AI analyzes your skills, experience, and preferences to find the perfect job matches for you.",
              },
              {
                q: "Can I export my profile?",
                a: "Absolutely! You can download your profile as PDF and use it for applications elsewhere.",
              },
              {
                q: "How long does it take to get hired?",
                a: "Our users get job offers within 2–4 weeks on average, depending on profile completeness and job search activity.",
              },
            ].map((item) => (
              <div key={item.q} className="faq-item">
                <h5 className="faq-question">{item.q}</h5>
                <p className="faq-answer">{item.a}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section className="cta-section">
        <Container>
          <div className="cta-inner">
            <h2 className="cta-title">Ready to Build Your Future?</h2>
            <p className="cta-subtitle">
              Join 50,000+ professionals who found their dream jobs with Smart Persona
            </p>
            <a href="/login" className="ds-btn-primary cta-btn">
              Get Started Free — No Credit Card Required
            </a>
          </div>
        </Container>
      </section>
    </div>
  );
}
