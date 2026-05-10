import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Box, TextField, Button, Typography, Alert, InputAdornment, IconButton, CircularProgress } from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, Person, HowToReg } from '@mui/icons-material';
import logo from '../assets/logo.svg';

const Signup = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            const { firstName, lastName, email, password } = formData;
            const response = await authService.signup({ firstName, lastName, email, password });
            const { token, ...userData } = response.data;
            login(token, userData);
            navigate('/dashboard');
        } catch (err) {
            const status = err.response?.status;
            const msg = err.response?.data?.message?.toLowerCase() || '';
            if (status === 409 || msg.includes('already exists') || msg.includes('duplicate')) {
                setError('An account with this email already exists. Please login or use a different email.');
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Signup failed. Please check your details and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Left panel */}
            <Box
                sx={{
                    display: { xs: 'none', md: 'flex' },
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'linear-gradient(160deg, #0369a1 0%, #075985 60%, #0c4a6e 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Box sx={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'rgba(255,179,0,0.05)', top: -150, right: -150 }} />
                <Box sx={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', bottom: -100, left: -100 }} />
                <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', px: 6 }}>
                    <img src={logo} alt="DocuMind" style={{ width: 72, height: 72, marginBottom: 24 }} />
                    <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1.5 }}>
                        DocuMind
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.55)', fontWeight: 400, maxWidth: 320 }}>
                        AI-powered document intelligence platform
                    </Typography>
                </Box>
            </Box>

            {/* Right panel — form */}
            <Box
                sx={{
                    flex: { xs: 1, md: '0 0 480px' },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    px: { xs: 4, md: 7 },
                    py: 6,
                    bgcolor: '#ffffff',
                    overflowY: 'auto',
                }}
            >
                <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 4 }}>
                    <img src={logo} alt="DocuMind" style={{ width: 36, height: 36 }} />
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#075985' }}>DocuMind</Typography>
                </Box>

                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1d2129', mb: 0.5 }}>
                    Create account
                </Typography>
                <Typography variant="body1" sx={{ color: '#6e7c87', mb: 3.5 }}>
                    Get started with DocuMind
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            fullWidth label="First Name" name="firstName" value={formData.firstName}
                            onChange={handleChange} required margin="normal"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: '#0369a1' }} /></InputAdornment> }}
                        />
                        <TextField
                            fullWidth label="Last Name" name="lastName" value={formData.lastName}
                            onChange={handleChange} required margin="normal"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: '#0369a1' }} /></InputAdornment> }}
                        />
                    </Box>

                    <TextField
                        fullWidth label="Email Address" name="email" type="email" value={formData.email}
                        onChange={handleChange} required margin="normal"
                        sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#0369a1' }} /></InputAdornment> }}
                    />

                    <TextField
                        fullWidth label="Password" name="password" type={showPassword ? 'text' : 'password'}
                        value={formData.password} onChange={handleChange} required margin="normal"
                        sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#0369a1' }} /></InputAdornment>,
                            endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>,
                        }}
                    />

                    <TextField
                        fullWidth label="Confirm Password" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword} onChange={handleChange} required margin="normal"
                        sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#0369a1' }} /></InputAdornment>,
                            endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>,
                        }}
                    />

                    <Button
                        type="submit" fullWidth variant="contained" size="large"
                        disabled={loading} startIcon={loading ? null : <HowToReg />}
                        sx={{
                            py: 1.5, borderRadius: 2,
                            background: 'linear-gradient(135deg, #0369a1 0%, #075985 100%)',
                            fontSize: '1rem', fontWeight: 600, textTransform: 'none',
                            boxShadow: '0 4px 14px rgba(0,53,102,0.3)',
                            '&:hover': { background: 'linear-gradient(135deg, #075985 0%, #0c4a6e 100%)', boxShadow: '0 6px 20px rgba(0,53,102,0.45)' },
                        }}
                    >
                        {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Create Account'}
                    </Button>

                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Typography variant="body2" sx={{ color: '#6e7c87' }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ textDecoration: 'none', color: '#0369a1', fontWeight: 700 }}>
                                Sign in
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Signup;
