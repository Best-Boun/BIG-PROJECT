import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AccessControl from "./Admin/AccessControl";
import Ads from "./Admin/Ads";
import Api from "./Admin/Api";



// ป้องกันหน้า admin (ProtectedRoute)
function ProtectedRoute({ children }) {
  const role = localStorage.getItem("role");
  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AccessControl />} />
        <Route
          path="/ads"
          element={
            <ProtectedRoute>
              <Ads />
            </ProtectedRoute>
          }
        />
        <Route
          path="/api"
          element={
            <ProtectedRoute>
              <Api />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
