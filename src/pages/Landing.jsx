// ==========================================
// 🏠 LANDING.JSX - Home Page
// ==========================================
// ใช้: หน้าแรกสำหรับผู้ใช้ที่ยังไม่ login
// ความเข้าใจ: แสดง features, benefits, testimonials

import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { 
    FaChartLine, 
    FaPalette, 
    FaRobot, 
    FaStar,
    FaCheckCircle,
    FaArrowRight 
} from 'react-icons/fa';
import './Landing.css';

export default function Landing() {
    // ✅ Features Data
    const features = [
        {
            id: 1,
            icon: <FaChartLine />,
            title: "Interactive Profile",
            description: "Create a living portfolio that showcases your work, skills, and personality. Stand out from traditional resumes."
        },
        {
            id: 2,
            icon: <FaPalette />,
            title: "Beautiful Templates",
            description: "Choose from professionally designed templates. Customize colors, fonts, and layouts to match your personal brand."
        },
        {
            id: 3,
            icon: <FaRobot />,
            title: "Smart Job Matching",
            description: "AI-powered matching connects you with opportunities that fit your skills and career goals perfectly."
        }
    ];

    // ✅ How It Works Steps
    const steps = [
        {
            id: 1,
            number: "1",
            icon: "✏️",
            title: "Create Profile",
            description: "Build your digital identity in minutes. Add your experience, skills, and portfolio."
        },
        {
            id: 2,
            number: "2",
            icon: "🎨",
            title: "Customize Design",
            description: "Choose a template and personalize it with your brand colors, fonts, and layout."
        },
        {
            id: 3,
            number: "3",
            icon: "🚀",
            title: "Get Matched & Land Jobs",
            description: "AI finds perfect job matches for you. Apply with one click and start your career."
        }
    ];

    // ✅ Testimonials Data
    const testimonials = [
        {
            id: 1,
            name: "Sarah Chen",
            role: "Product Manager",
            avatar: "SC",
            rating: 5,
            text: "Smart Persona helped me stand out. I got 3 job offers within a month!"
        },
        {
            id: 2,
            name: "John Smith",
            role: "Software Engineer",
            avatar: "JS",
            rating: 5,
            text: "The AI matching is incredible. Found a job that perfectly aligns with my skills."
        },
        {
            id: 3,
            name: "Emily Rodriguez",
            role: "UX Designer",
            avatar: "ER",
            rating: 5,
            text: "Templates are beautiful and easy to customize. Love the interactive portfolio feature!"
        }
    ];

    // ✅ Companies (Social Proof)
    const companies = ["Tech Corp", "Design Co", "Startup Inc", "Global LLC"];

    return (
        <div className="landing-page">
            {/* ========================================
                HERO SECTION
                ======================================== */}
            <section className="hero-section">
                <Container>
                    <Row className="align-items-center" style={{ minHeight: '600px' }}>
                        <Col lg={12} className="text-center">
                            <h1 className="hero-title">
                                Build Your Professional Identity
                            </h1>
                            <p className="hero-subtitle">
                                More than a resume. Create an interactive portfolio that showcases 
                                your skills, experience, and personality to land your dream job.
                            </p>
                            <div className="hero-buttons">
                                <Button 
                                    size="lg" 
                                    className="btn-hero-primary"
                                    href="/login"
                                >
                                    Get Started Free <FaArrowRight />
                                </Button>
                                <Button 
                                    size="lg" 
                                    className="btn-hero-secondary"
                                    onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                                >
                                    Learn More
                                </Button>
                            </div>
                            <p className="hero-cta-text">✨ No credit card required • Free forever plan • Join 50,000+ professionals</p>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* ========================================
                FEATURES SECTION
                ======================================== */}
            <section id="features" className="features-section">
                <Container>
                    <div className="section-header">
                        <h2 className="section-title">Why Choose Smart Persona?</h2>
                        <p className="section-subtitle">Everything you need to showcase your professional story</p>
                    </div>

                    <Row>
                        {features.map(feature => (
                            <Col lg={4} md={6} key={feature.id} className="mb-4">
                                <div className="feature-card">
                                    <div className="feature-icon">
                                        {feature.icon}
                                    </div>
                                    <h3>{feature.title}</h3>
                                    <p>{feature.description}</p>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* ========================================
                SOCIAL PROOF SECTION
                ======================================== */}
            <section className="social-proof-section">
                <Container>
                    <div className="social-proof-content">
                        <h2 className="section-title white">Trusted by 50,000+ Professionals</h2>
                        <p className="section-subtitle white">Join thousands of successful job seekers</p>
                        
                        <div className="logos-grid">
                            {companies.map((company, idx) => (
                                <div key={idx} className="logo-box">
                                    {company}
                                </div>
                            ))}
                        </div>

                        <div className="stats-grid">
                            <div className="stat-item">
                                <h4>50,000+</h4>
                                <p>Users</p>
                            </div>
                            <div className="stat-item">
                                <h4>10,000+</h4>
                                <p>Jobs Posted</p>
                            </div>
                            <div className="stat-item">
                                <h4>95%</h4>
                                <p>Success Rate</p>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* ========================================
                HOW IT WORKS SECTION
                ======================================== */}
            <section className="how-it-works-section">
                <Container>
                    <div className="section-header">
                        <h2 className="section-title">How It Works</h2>
                        <p className="section-subtitle">Get started in three simple steps</p>
                    </div>

                    <Row className="steps-grid">
                        {steps.map(step => (
                            <Col lg={4} md={6} key={step.id} className="mb-4">
                                <div className="step-card">
                                    <div className="step-number">{step.number}</div>
                                    <div className="step-icon">{step.icon}</div>
                                    <h3>{step.title}</h3>
                                    <p>{step.description}</p>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* ========================================
                TESTIMONIALS SECTION
                ======================================== */}
            <section className="testimonials-section">
                <Container>
                    <div className="section-header">
                        <h2 className="section-title">What Our Users Say</h2>
                        <p className="section-subtitle">Real stories from real people</p>
                    </div>

                    <Row className="testimonials-grid">
                        {testimonials.map(testimonial => (
                            <Col lg={4} md={6} key={testimonial.id} className="mb-4">
                                <div className="testimonial-card">
                                    <div className="stars">
                                        {'⭐'.repeat(testimonial.rating)}
                                    </div>
                                    <p className="testimonial-text">"{testimonial.text}"</p>
                                    <div className="testimonial-author">
                                        <div className="author-avatar">
                                            {testimonial.avatar}
                                        </div>
                                        <div className="author-info">
                                            <h5>{testimonial.name}</h5>
                                            <p>{testimonial.role}</p>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* ========================================
                FEATURES LIST SECTION
                ======================================== */}
            <section className="features-list-section">
                <Container>
                    <Row className="align-items-center">
                        <Col lg={6} className="mb-4">
                            <h2 className="section-title text-start">Packed with Powerful Features</h2>
                            
                            <ul className="features-list">
                                <li><FaCheckCircle /> Interactive portfolio builder</li>
                                <li><FaCheckCircle /> Professional templates</li>
                                <li><FaCheckCircle /> AI-powered job matching</li>
                                <li><FaCheckCircle /> One-click applications</li>
                                <li><FaCheckCircle /> Resume builder</li>
                                <li><FaCheckCircle /> Analytics dashboard</li>
                            </ul>

                            <Button 
                                size="lg" 
                                className="btn-hero-primary"
                                href="/login"
                                style={{ marginTop: '30px' }}
                            >
                                Get Started Now <FaArrowRight />
                            </Button>
                        </Col>

                        <Col lg={6} className="mb-4">
                            <div className="features-illustration">
                                <div className="phone-mockup">
                                    <div className="phone-content">
                                        <div className="phone-header">Profile</div>
                                        <div className="phone-item">👤 Alex Johnson</div>
                                        <div className="phone-item">💼 Senior Developer</div>
                                        <div className="phone-item">⭐ 8 years exp</div>
                                        <div className="phone-button">View Profile →</div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* ========================================
                FAQ SECTION
                ======================================== */}
            <section className="faq-section">
                <Container>
                    <div className="section-header">
                        <h2 className="section-title">Frequently Asked Questions</h2>
                    </div>

                    <Row>
                        <Col lg={6} className="mb-3">
                            <div className="faq-item">
                                <h5>Is Smart Persona really free?</h5>
                                <p>Yes! Our free plan includes profile creation, job browsing, and 5 applications per month.</p>
                            </div>
                        </Col>
                        <Col lg={6} className="mb-3">
                            <div className="faq-item">
                                <h5>How does AI matching work?</h5>
                                <p>Our AI analyzes your skills, experience, and preferences to find the perfect job matches for you.</p>
                            </div>
                        </Col>
                        <Col lg={6} className="mb-3">
                            <div className="faq-item">
                                <h5>Can I export my profile?</h5>
                                <p>Absolutely! You can download your profile as PDF and use it for applications elsewhere.</p>
                            </div>
                        </Col>
                        <Col lg={6} className="mb-3">
                            <div className="faq-item">
                                <h5>How long does it take to get hired?</h5>
                                <p>Our users get job offers within 2-4 weeks on average. It depends on your profile and job search.</p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* ========================================
                FINAL CTA SECTION
                ======================================== */}
            <section className="final-cta-section">
                <Container>
                    <div className="cta-content">
                        <h2>Ready to Build Your Future?</h2>
                        <p>Join 50,000+ professionals who found their dream jobs with Smart Persona</p>
                        <Button 
                            size="lg" 
                            className="btn-cta-primary"
                            href="/login"
                        >
                            Get Started Free - No Credit Card Required
                        </Button>
                    </div>
                </Container>
            </section>
        </div>
    );
}

/*
📖 อธิบาย Landing Component:

1. **Data Arrays:**
   - features = 3 คุณสมบัติหลัก
   - steps = ขั้นตอน 3 ขั้น
   - testimonials = ข้อมูลผู้ใช้ 3 คน
   - companies = ชื่อบริษัท

2. **Sections:**
   - Hero Section = หัวข้อหลัก + CTA
   - Features = ข้อมูล 3 ฟีเจอร์
   - Social Proof = สถิติ
   - How It Works = ขั้นตอน
   - Testimonials = รีวิว
   - Features List = รายการคุณสมบัติ
   - FAQ = คำถามที่พบบ่อย
   - Final CTA = เรียกหนึ่ง

3. **UI Components:**
   - .map() = Loop data
   - Bootstrap Grid (Row, Col)
   - Icons from react-icons
   - Buttons with href

4. **ไม่ต้อง Login:**
   - ทุกคนเข้าได้
   - ลิงก์ไปยัง /login
   - ไม่ประสงค์ Protected Route

5. **Styling:**
   - ใช้ Landing.css
   - Responsive layout
   - Smooth scrolling
*/