import { useState, useContext } from 'react';
import { Container, Row, Col, Button, Card, Alert } from 'react-bootstrap';
import { FaPlus, FaArrowRight } from 'react-icons/fa';
import { ProfileContext } from "../ProfileContext.jsx";
import ResumeEditor from './ResumeEditor.jsx';
import Header2 from '../components/Header2';


 const handleLogout = () => {
        // ตัวอย่าง: ล้าง token และ redirect
        localStorage.removeItem('token');
        window.location.href = '/login'; // หรือใช้ useNavigate
    };

    const currentUser = { username: 'John Doe', role: 'user' }; // หรือ user จาก context/state จริง
function ChooseModeScreen({ onSelectMode }) {
  return (
    <>
    <Header2 user={currentUser} onLogout={handleLogout} />
    <div className="choose-mode-container">
      <Container style={{width:'100%', padding:'20px'}} className="py-5">
        <div className="mode-header mb-5">
          <h1>Create Your Resume</h1>
          <p>Choose how you want to create your resume</p>
        </div>

        <Row className="g-4">
          {/* Option 1: Import from Profile */}
          <Col md={6}>
            <Card className="mode-card mode-import">
              <Card.Body className="text-center p-5">
                <h3 className="mt-4 mb-3">Use My Profile</h3>
                <p className="text-muted mb-4">
                  Import all your profile information including experience, education, and skills. 
                  Fast and easy!
                </p>
                <ul className="benefits-list text-start mb-4">
                  <li>✓ All profile data auto-filled</li>
                  <li>✓ Save time editing</li>
                  <li>✓ Keep data consistent</li>
                  <li>✓ One-click import</li>
                </ul>
                <Button
                  size="lg"
                  className="btn-mode-primary w-100"
                  onClick={() => onSelectMode('import')}
                >
                  <FaArrowRight className="me-2" />
                  Import from Profile
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Option 2: Create New */}
          <Col md={6}>
            <Card className="mode-card mode-create">
              <Card.Body className="text-center p-5">
                <h3 className="mt-4 mb-3">Create New Resume</h3>
                <p className="text-muted mb-4">
                  Start from scratch and create a custom resume. 
                  Perfect for tailoring to specific job applications.
                </p>
                <ul className="benefits-list text-start mb-4">
                  <li>✓ Full customization</li>
                  <li>✓ Create multiple resumes</li>
                  <li>✓ Tailor for each job</li>
                  <li>✓ Add unique details</li>
                </ul>
                <Button
                  size="lg"
                  className="btn-mode-secondary w-100"
                  onClick={() => onSelectMode('create')}
                >
                  <FaPlus className="me-2" />
                  Create New Resume
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Tips */}
        <Card className="mt-5 tips-card">
          <Card.Body>
            <h5 className="mb-3">💡 Tips</h5>
            <Row className="g-3">
              <Col md={6}>
                <strong>Import Profile</strong>
                <p className="mb-0 small text-muted">
                  Best when your profile is already complete and accurate. Edit as needed.
                </p>
              </Col>
              <Col md={6}>
                <strong>Create New</strong>
                <p className="mb-0 small text-muted">
                  Best when you want to customize the resume for a specific job or role.
                </p>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </div>
    </>
  );
}

// ============================================
// MAIN RESUME PAGE
// ============================================
export default function ResumePage() {
  // ✅ อ่าน: ตรวจสอบ ProfileContext
  const context = useContext(ProfileContext);
  
  if (!context) {
    console.error('ProfileContext is not available');
    return (
      <div className="p-5 text-center">
        <Alert variant="danger">
          <strong>Error:</strong> Profile context is not found. Please check ProfileContext setup.
        </Alert>
      </div>
    );
  }

  // ✅ อ่าน: ใช้ context.profileData หรือ object เปล่า
  const profileData = context?.profileData || {};

  // ✅ Debug: Log profile data
  console.log('Profile Data Available:', profileData);

  // State Management
  const [mode, setMode] = useState(null); // null | 'editor'
  const [resumeData, setResumeData] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // ============================================
  // HANDLERS
  // ============================================
  const handleSelectMode = (selectedMode) => {
    if (selectedMode === 'import') {
      // ✅ Import Mode: แปลง profileData เป็น resumeData
      const resumeFromProfile = {
        ...profileData,
        employment: profileData.experience || [],  // experience → employment
        education: profileData.education || [],
        languages: profileData.languages || [],
        hobbies: profileData.hobbies || [],
        currentStatus: profileData.employmentStatus || '',
        currentCompany: profileData.currentCompany || '',
        currentRole: profileData.currentRole || '',
        openToWork: profileData.openToWork || false,
      };
      setResumeData(resumeFromProfile);
      setMode('editor');
      setAlertMessage('✅ Profile data loaded successfully!');
      setShowAlert(true);
    } else if (selectedMode === 'create') {
      // ✅ Create Mode: ฟอร์มว่างเปล่า
      setMode('editor');
      setResumeData({
        name: '',
        title: '',
        email: '',
        phone: '',
        location: '',
        summary: '',
        profile: '',
        experience: [],
        education: [],
        employment: [],
        skills: [],
        languages: [],
        hobbies: [],
        certificates: [],
        references: '',
        achievements: []
      });
    }
  };

  const handleBackToModeSelect = () => {
    setMode(null);
    setResumeData(null);
  };

  // ============================================
  // RENDER
  // ============================================
  
  // ✅ Mode: Editor
  if (mode === 'editor' && resumeData) {
    return (
      <div>
        {showAlert && (
          <Alert 
            variant="success" 
            dismissible 
            onClose={() => setShowAlert(false)}
            className="m-3"
          >
            {alertMessage}
          </Alert>
        )}
        <div className="d-flex align-items-center mb-3 px-3">
          <Button
            variant="link"
            onClick={handleBackToModeSelect}
            className="text-decoration-none"
          >
            ← Back to Mode Selection
          </Button>
        </div>
        <ResumeEditor initialData={resumeData} />
      </div>
    );
  }

  // ✅ Default: Mode Selection
  return <ChooseModeScreen onSelectMode={handleSelectMode} />;
}