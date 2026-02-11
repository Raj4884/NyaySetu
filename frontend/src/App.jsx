import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import Laws from './pages/Laws';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route element={<ProtectedRoute roles={['judge', 'lawyer', 'citizen']} />}>
                        <Route path="/" element={<Layout><Dashboard /></Layout>} />
                        <Route path="/cases" element={<Layout><Cases /></Layout>} />
                        <Route path="/laws" element={<Layout><Laws /></Layout>} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
