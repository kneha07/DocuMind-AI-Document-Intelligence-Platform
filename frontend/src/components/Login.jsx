import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Box, TextField, Button, Typography, Alert, InputAdornment, IconButton, CircularProgress } from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import logo from '../assets/logo.svg';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await authService.login({ email, password });
            const userData = {
                email: response.data.email,
                firstName: response.data.firstName,
                lastName: response.data.lastName
            };
            login(response.data.token, userData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data || 'Login failed. Please check your credentials.');
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
                    flex: { xs: 1, md: '0 0 460px' },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    px: { xs: 4, md: 7 },
                    py: 6,
                    bgcolor: '#ffffff',
                }}
            >
                <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 4 }}>
                    <img src={logo} alt="DocuMind" style={{ width: 36, height: 36 }} />
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#075985' }}>DocuMind</Typography>
                </Box>

                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1d2129', mb: 0.5 }}>
                    Welcome back
                </Typography>
                <Typography variant="body1" sx={{ color: '#6e7c87', mb: 4 }}>
                    Sign in to continue
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        fullWidth label="Email Address" type="email"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        required margin="normal"
                        sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Email sx={{ color: '#0369a1', fontSize: 20 }} /></InputAdornment>,
                        }}
                    />

                    <TextField
                        fullWidth label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        required margin="normal"
                        sx={{ mb: 3.5, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#0369a1', fontSize: 20 }} /></InputAdornment>,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button
                        type="submit" fullWidth variant="contained" size="large"
                        disabled={loading} startIcon={loading ? null : <LoginIcon />}
                        sx={{
                            py: 1.5, borderRadius: 2,
                            background: 'linear-gradient(135deg, #0369a1 0%, #075985 100%)',
                            fontSize: '1rem', fontWeight: 600, textTransform: 'none',
                            boxShadow: '0 4px 14px rgba(0,53,102,0.3)',
                            '&:hover': { background: 'linear-gradient(135deg, #075985 0%, #0c4a6e 100%)', boxShadow: '0 6px 20px rgba(0,53,102,0.45)' },
                        }}
                    >
                        {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Sign In'}
                    </Button>

                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Typography variant="body2" sx={{ color: '#6e7c87' }}>
                            Don't have an account?{' '}
                            <Link to="/signup" style={{ textDecoration: 'none', color: '#0369a1', fontWeight: 700 }}>
                                Sign up
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Login;
