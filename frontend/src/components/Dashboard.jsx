import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fileService } from '../services/api';
import {
    Box, Typography, Button, Paper, AppBar, Toolbar, List, ListItem,
    ListItemIcon, ListItemText, Avatar, IconButton, Alert, CircularProgress,
    TextField, InputAdornment, Drawer, Fab, Menu, MenuItem, Chip, Divider,
    Dialog, DialogTitle, DialogContent, DialogActions, ButtonGroup,
    Select, FormControl, InputLabel
} from '@mui/material';
import {
    CloudUpload, Download, Delete, Logout, InsertDriveFile, Dashboard as DashboardIcon,
    Folder, PeopleAlt, Search, Image, PictureAsPdf, Description,
    MoreVert, Add, Share, Email, FilterList, Sort, CalendarToday, ViewList, ViewModule, Edit,
    SmartToy, ExpandMore, Visibility
} from '@mui/icons-material';
import logo from '../assets/logo.svg';

const DRAWER_WIDTH = 280;

const C = {
    primary:     '#0369a1',
    dark:        '#075985',
    accent:      '#0ea5e9',
    accentFab:   '#0ea5e9',
    accentFabHover: '#0284c7',
    bg:          '#f8fafc',
    surface:     '#ffffff',
    border:      '#e2e8f0',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    tint:        '#e0f2fe',
    shadow:      'rgba(3, 105, 161, 0.12)',
    shadowHover: 'rgba(3, 105, 161, 0.22)',
};

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [files, setFiles] = useState([]);
    const [newFileName, setNewFileName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadingFileName, setUploadingFileName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchMode, setSearchMode] = useState('normal'); // 'normal' or 'ai'
    const [aiSearching, setAiSearching] = useState(false);
    const [aiAnswer, setAiAnswer] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [shareEmail, setShareEmail] = useState('');
    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const [currentView, setCurrentView] = useState('dashboard');
    const [allFiles, setAllFiles] = useState([]); // ADD THIS LINE


    // Filter states
    const [fileTypeFilter, setFileTypeFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState(localStorage.getItem('viewMode') || 'grid');
    const [expandedFiles, setExpandedFiles] = useState(new Set()); // Track which files are expanded
    const [isDragging, setIsDragging] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [activityFeed, setActivityFeed] = useState([]);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        { role: 'ai', text: 'Hi! Ask me anything about your documents.' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const chatBottomRef = useRef(null);

    useEffect(() => {
        loadFiles();
    }, []);

    useEffect(() => {
        if (!success) return;
        const timer = setTimeout(() => setSuccess(''), 4000);
        return () => clearTimeout(timer);
    }, [success]);

    useEffect(() => {
        if (searchQuery === '' && searchMode === 'ai') {
            loadFiles();
            setAiAnswer('');
        }
    }, [searchQuery]);

    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.querySelector('input[placeholder*="doc"], input[placeholder*="Find"]')?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Auto-expand all in list view, collapse all in grid view
    useEffect(() => {
        if (viewMode === 'list') {
            setExpandedFiles(new Set(files.map(f => f.id)));
        } else {
            setExpandedFiles(new Set());
        }
    }, [viewMode, files]);


    const loadFiles = async () => {
        setLoading(true);
        try {
            const response = await fileService.getAllFiles();
            const sortedFiles = response.data.sort((a, b) =>
                new Date(b.uploadedAt) - new Date(a.uploadedAt)
            );
            setFiles(sortedFiles);
        } catch (err) {
            setError('Failed to load files');
        } finally {
            setLoading(false);
        }
    };

    const handleAISearch = async () => {
        if (!searchQuery.trim()) {
            loadFiles(); // If empty, load all files
            return;
        }

        setAiSearching(true);
        setAiAnswer('');
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [searchRes, answerRes] = await Promise.all([
                fetch(`http://localhost:8080/api/files/search/ai?query=${encodeURIComponent(searchQuery)}`, { headers }),
                fetch(`http://localhost:8080/api/files/search/ai/answer?query=${encodeURIComponent(searchQuery)}`, { headers }),
            ]);

            const results = await searchRes.json();
            setFiles(results);

            if (answerRes.ok && answerRes.status !== 204) {
                const answer = await answerRes.text();
                setAiAnswer(answer);
            }

            if (results.length === 0) {
                setError('No matching documents found. Try a different query!');
            }
        } catch (err) {
            setError('AI search failed. Please try again.');
        } finally {
            setAiSearching(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);

        // If in normal mode, keep existing behavior
        if (searchMode === 'normal') {
            // Normal search happens through filtering (existing code)
        }
    };

    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter' && searchMode === 'ai') {
            handleAISearch();
        }
    };

    const handleFileUpload = async (file) => {
        if (!file) return;
        setUploading(true);
        setUploadProgress(0);
        setUploadingFileName(file.name);
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) return prev;
                    return prev + 10;
                });
            }, 200);

            const response = await fileService.uploadFile(formData);

            clearInterval(progressInterval);
            setUploadProgress(100);

            setTimeout(() => {
                // Add the new file to state instead of reloading all files
                const newFile = response.data;
                setFiles(prevFiles => [newFile, ...prevFiles].sort((a, b) =>
                    new Date(b.uploadedAt) - new Date(a.uploadedAt)
                ));

                setSuccess(`File "${file.name}" uploaded successfully.`);
                addActivity('Uploaded', file.name, 'upload');
                setUploadProgress(0);
                setUploadingFileName('');
            }, 500);
        } catch (err) {
            setError('Failed to upload file');
            setUploadProgress(0);
            setUploadingFileName('');
        } finally {
            setTimeout(() => setUploading(false), 600);
        }
    };

    const handleFileInputChange = (event) => {
        const file = event.target.files[0];
        handleFileUpload(file);
        event.target.value = '';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsDragging(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
    };

    const handleChatSend = async () => {
        if (!chatInput.trim() || chatLoading) return;
        const question = chatInput.trim();
        setChatInput('');
        setChatMessages(prev => [...prev, { role: 'user', text: question }]);
        setChatLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(
                `http://localhost:8080/api/files/search/ai/answer?query=${encodeURIComponent(question)}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.ok && res.status !== 204) {
                const answer = await res.text();
                setChatMessages(prev => [...prev, { role: 'ai', text: answer }]);
            } else {
                setChatMessages(prev => [...prev, { role: 'ai', text: "I couldn't find relevant information in your documents for that question." }]);
            }
        } catch {
            setChatMessages(prev => [...prev, { role: 'ai', text: 'Something went wrong. Please try again.' }]);
        } finally {
            setChatLoading(false);
        }
    };

    const handleMenuOpen = (event, file) => {
        setAnchorEl(event.currentTarget);
        setSelectedFile(file);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedFile(null);
    };

    const addActivity = (action, fileName, icon) => {
        const entry = { action, fileName, icon, time: new Date() };
        setActivityFeed(prev => [entry, ...prev].slice(0, 20));
    };

    const handleOpenFile = async (file) => {
        try {
            const response = await fileService.downloadFile(file.id);
            const blob = new Blob([response.data], { type: file.fileType || 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);
            if (file.fileType?.includes('image') || file.fileType?.includes('pdf') || file.fileType?.includes('text')) {
                setPreviewFile(file);
                setPreviewUrl(url);
                addActivity('Previewed', file.originalFileName, 'preview');
            } else {
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', file.originalFileName);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
                addActivity('Downloaded', file.originalFileName, 'download');
            }
        } catch (err) {
            setError('Failed to open file');
        }
    };

    const handleDownload = async (file) => {
        try {
            const response = await fileService.downloadFile(file.id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.originalFileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setSuccess('File downloaded successfully.');
        } catch (err) {
            setError('Failed to download file');
        }
    };

    const handleDelete = async () => {
        if (!selectedFile) return;
        if (!window.confirm(`Delete "${selectedFile.originalFileName}"?`)) {
            handleMenuClose();
            return;
        }

        const fileToDelete = selectedFile;
        handleMenuClose();

        try {
            await fileService.deleteFile(fileToDelete.id);

            // Remove the deleted file from state (no reload)
            setFiles(prevFiles => prevFiles.filter(file => file.id !== fileToDelete.id));

            setSuccess('File deleted successfully.');
            addActivity('Deleted', fileToDelete.originalFileName, 'delete');
        } catch (err) {
            setError('Failed to delete file');
        }
    };

    const handleShareFile = async () => {
        if (!selectedFile || !shareEmail) return;

        const fileToShare = selectedFile;

        // Check if email is already in sharedWith list
        if (fileToShare.sharedWith && fileToShare.sharedWith.includes(shareEmail)) {
            setError(`File is already shared with ${shareEmail}!`);
            setShareDialogOpen(false);
            setShareEmail('');
            handleMenuClose();
            return;
        }

        // Check if trying to share with owner
        if (fileToShare.ownerEmail === shareEmail) {
            setError(`You cannot share a file with yourself!`);
            setShareDialogOpen(false);
            setShareEmail('');
            handleMenuClose();
            return;
        }

        setShareDialogOpen(false);
        setShareEmail('');
        handleMenuClose();

        try {
            await fileService.shareFile(fileToShare.id, shareEmail);

            // Update only the shared file in the state (no page refresh)
            const updateFiles = (prevFiles) => prevFiles.map(file =>
                file.id === fileToShare.id
                    ? {
                        ...file,
                        sharedWith: file.sharedWith
                            ? [...file.sharedWith, shareEmail]
                            : [shareEmail]
                    }
                    : file
            );
            setAllFiles(updateFiles);
            setFiles(updateFiles);

            setSuccess(`File shared with ${shareEmail}.`);
            addActivity('Shared', fileToShare.originalFileName, 'share');
        } catch (err) {
            // Don't reload on error, just show error message
            setError('Failed to share file. The user might already have access.');
            console.error('Share error:', err);
        }
    };

    const handleRenameFile = async () => {
        if (!selectedFile || !newFileName) return;

        const fileToRename = selectedFile;
        const oldName = fileToRename.originalFileName;
        setRenameDialogOpen(false);
        setNewFileName('');
        handleMenuClose();

        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:8080/api/files/rename/${fileToRename.id}?newFileName=${encodeURIComponent(newFileName)}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Update only the renamed file in state (no reload)
            setFiles(prevFiles =>
                prevFiles.map(file =>
                    file.id === fileToRename.id
                        ? { ...file, originalFileName: newFileName }
                        : file
                )
            );

            setSuccess(`File renamed to "${newFileName}".`);
            addActivity('Renamed', `${oldName} → ${newFileName}`, 'rename');
        } catch (err) {
            setError('Failed to rename file');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getFileIcon = (fileType) => {
        if (fileType?.includes('image')) return <Image sx={{ fontSize: 40, color: '#10b981' }} />;
        if (fileType?.includes('pdf')) return <PictureAsPdf sx={{ fontSize: 40, color: '#ef4444' }} />;
        if (fileType?.includes('text')) return <Description sx={{ fontSize: 40, color: C.primary }} />;
        return <InsertDriveFile sx={{ fontSize: 40, color: '#94a3b8' }} />;
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const getTotalSize = () => {
        const total = files.reduce((acc, file) => acc + file.fileSize, 0);
        return formatFileSize(total);
    };

    const getViewTitle = () => {
        if (currentView === 'dashboard') return 'Recent Documents';
        if (currentView === 'myDocuments') return 'My Documents';
        if (currentView === 'shared') return 'Shared with Me';
        if (currentView === 'activity') return 'Activity Feed';
        return 'Files';
    };

    const toggleFileExpand = (fileId) => {
        setExpandedFiles(prev => {
            const newSet = new Set(prev);
            if (newSet.has(fileId)) {
                newSet.delete(fileId);
            } else {
                newSet.add(fileId);
            }
            return newSet;
        });
    };

    const getFilteredFilesByView = () => {
        if (currentView === 'dashboard') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return files.filter(file =>
                file.ownerEmail === user?.email &&
                new Date(file.uploadedAt) >= sevenDaysAgo
            );
        } else if (currentView === 'myDocuments') {
            return files.filter(file => file.ownerEmail === user?.email);
        } else if (currentView === 'shared') {
            return files.filter(file =>
                file.sharedWith &&
                file.sharedWith.includes(user?.email) &&
                file.ownerEmail !== user?.email
            );
        }
        return files;
    };

    // Apply all filters (only for normal search mode)
    const getFilteredAndSortedFiles = () => {
        // If AI search mode and has query, show AI results as-is
        if (searchMode === 'ai' && searchQuery.trim()) {
            return files; // AI search already returns filtered results
        }

        let result = getFilteredFilesByView();

        // Apply search query (normal mode)
        if (searchQuery && searchMode === 'normal') {
            result = result.filter(file =>
                file.originalFileName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply file type filter
        if (fileTypeFilter !== 'all') {
            result = result.filter(file => {
                if (fileTypeFilter === 'pdf') return file.fileType?.includes('pdf');
                if (fileTypeFilter === 'image') return file.fileType?.includes('image');
                if (fileTypeFilter === 'document') return file.fileType?.includes('text') || file.fileType?.includes('document');
                return true;
            });
        }

        // Apply date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            result = result.filter(file => {
                const fileDate = new Date(file.uploadedAt);
                if (dateFilter === 'today') {
                    return fileDate.toDateString() === now.toDateString();
                }
                if (dateFilter === 'week') {
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return fileDate >= weekAgo;
                }
                if (dateFilter === 'month') {
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    return fileDate >= monthAgo;
                }
                return true;
            });
        }

        // Apply sorting
        result = [...result].sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.uploadedAt) - new Date(a.uploadedAt);
            if (sortBy === 'oldest') return new Date(a.uploadedAt) - new Date(b.uploadedAt);
            if (sortBy === 'largest') return b.fileSize - a.fileSize;
            if (sortBy === 'smallest') return a.fileSize - b.fileSize;
            if (sortBy === 'name') return a.originalFileName.localeCompare(b.originalFileName);
            return 0;
        });

        return result;
    };

    const filteredFiles = getFilteredAndSortedFiles();

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: C.bg }}>
            {/* Sidebar */}
            <Drawer
                variant="permanent"
                sx={{
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                        background: `linear-gradient(180deg, ${C.primary} 0%, ${C.dark} 100%)`,
                        color: 'white',
                        borderRight: 'none',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                    },
                }}
            >
                <Box sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    backdropFilter: 'blur(8px)',
                    background: 'rgba(255,255,255,0.08)',
                    borderBottom: '1px solid rgba(255,255,255,0.15)',
                }}>
                    <img src={logo} alt="Logo" style={{ width: 40, height: 40 }} />
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', lineHeight: 1.1 }}>
                            DocuMind
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,179,0,0.85)', fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', fontSize: '0.6rem' }}>
                            AI Document Intelligence
                        </Typography>
                    </Box>
                </Box>

                <List sx={{ px: 2, flexGrow: 1 }}>
                    <ListItem
                        button
                        onClick={() => setCurrentView('dashboard')}
                        sx={{
                            borderRadius: 2,
                            mb: 1,
                            bgcolor: currentView === 'dashboard' ? 'rgba(255,255,255,0.15)' : 'transparent',
                            borderLeft: currentView === 'dashboard' ? '3px solid white' : '3px solid transparent',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.10)' },
                            cursor: 'pointer'
                        }}
                    >
                        <ListItemIcon>
                            <DashboardIcon sx={{ color: 'white' }} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Dashboard"
                            primaryTypographyProps={{
                                fontWeight: currentView === 'dashboard' ? 600 : 400,
                                color: 'white'
                            }}
                        />
                    </ListItem>

                    <ListItem
                        button
                        onClick={() => setCurrentView('myDocuments')}
                        sx={{
                            borderRadius: 2,
                            mb: 1,
                            bgcolor: currentView === 'myDocuments' ? 'rgba(255,255,255,0.15)' : 'transparent',
                            borderLeft: currentView === 'myDocuments' ? '3px solid white' : '3px solid transparent',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.10)' },
                            cursor: 'pointer'
                        }}
                    >
                        <ListItemIcon>
                            <Folder sx={{ color: 'white' }} />
                        </ListItemIcon>
                        <ListItemText
                            primary="My Documents"
                            primaryTypographyProps={{
                                color: 'white',
                                fontWeight: currentView === 'myDocuments' ? 600 : 400
                            }}
                        />
                    </ListItem>

                    <ListItem
                        button
                        onClick={() => setCurrentView('shared')}
                        sx={{
                            borderRadius: 2,
                            bgcolor: currentView === 'shared' ? 'rgba(255,255,255,0.15)' : 'transparent',
                            borderLeft: currentView === 'shared' ? '3px solid white' : '3px solid transparent',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.10)' },
                            cursor: 'pointer'
                        }}
                    >
                        <ListItemIcon>
                            <PeopleAlt sx={{ color: 'white' }} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Shared with me"
                            primaryTypographyProps={{
                                color: 'white',
                                fontWeight: currentView === 'shared' ? 600 : 400
                            }}
                        />
                    </ListItem>

                    <ListItem
                        button
                        onClick={() => setCurrentView('activity')}
                        sx={{
                            borderRadius: 2,
                            mt: 1,
                            bgcolor: currentView === 'activity' ? 'rgba(255,255,255,0.15)' : 'transparent',
                            borderLeft: currentView === 'activity' ? '3px solid white' : '3px solid transparent',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.10)' },
                            cursor: 'pointer'
                        }}
                    >
                        <ListItemIcon>
                            <CalendarToday sx={{ color: 'white' }} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Activity"
                            primaryTypographyProps={{
                                color: 'white',
                                fontWeight: currentView === 'activity' ? 600 : 400
                            }}
                        />
                        {activityFeed.length > 0 && (
                            <Chip label={activityFeed.length} size="small" sx={{ bgcolor: C.accent, color: 'white', fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
                        )}
                    </ListItem>
                </List>

                {/* User profile section */}
                <Box sx={{ px: 3, py: 2, mt: 'auto', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                            sx={{
                                background: 'rgba(255,255,255,0.2)',
                                width: 36,
                                height: 36,
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                border: '1.5px solid rgba(255,255,255,0.4)',
                            }}
                        >
                            {(user?.firstName?.[0] || 'U').toUpperCase()}
                        </Avatar>
                        <Box sx={{ overflow: 'hidden' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'white', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user?.firstName} {user?.lastName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                                {user?.email}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ p: 3 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1, display: 'block', fontWeight: 600 }}>
                        AWS S3 Storage
                    </Typography>
                    <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', height: 8, borderRadius: 4, mb: 1 }}>
                        <Box
                            sx={{
                                bgcolor: C.accent,
                                height: 8,
                                borderRadius: 4,
                                width: `${Math.min((files.reduce((acc, f) => acc + f.fileSize, 0) / 15000000000) * 100, 100)}%`
                            }}
                        />
                    </Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500 }}>
                        {getTotalSize()} used · AES-256 encrypted
                    </Typography>
                </Box>
            </Drawer>

            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <AppBar
                    position="static"
                    elevation={0}
                    sx={{
                        background: 'white',
                        borderBottom: '1px solid #e8edf2',
                        boxShadow: '0 2px 12px rgba(3,105,161,0.07)',
                    }}
                >
                    <Toolbar sx={{ py: 1.5, px: 3 }}>
                        {/* Search Bar with AI Toggle */}
                        <TextField
                            placeholder={searchMode === 'ai'
                                ? 'Try: "Find Python guides" or "Budget documents"...'
                                : 'Let\'s find that doc...'}
                            variant="outlined"
                            size="small"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onKeyPress={handleSearchKeyPress}
                            sx={{
                                width: 600,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 8,
                                    bgcolor: searchMode === 'ai' ? C.tint : C.bg,
                                    '& fieldset': {
                                        borderColor: searchMode === 'ai' ? C.primary : '#e8edf2',
                                        borderWidth: searchMode === 'ai' ? 2 : 1
                                    },
                                    '&:hover fieldset': { borderColor: C.primary },
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        {searchMode === 'ai' ? (
                                            <SmartToy sx={{ color: C.primary }} />
                                        ) : (
                                            <Search sx={{ color: C.primary }} />
                                        )}
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {searchMode === 'ai' && searchQuery && (
                                                <IconButton
                                                    size="small"
                                                    onClick={handleAISearch}
                                                    disabled={aiSearching}
                                                >
                                                    {aiSearching ? (
                                                        <CircularProgress size={20} sx={{ color: C.primary }} />
                                                    ) : (
                                                        <Search sx={{ color: C.primary, fontSize: 20 }} />
                                                    )}
                                                </IconButton>
                                            )}
                                            <Chip
                                                // icon={searchMode === 'ai' ? <SmartToy /> : null}
                                                label={searchMode === 'ai' ? 'Basic' : '💡 AI Mode'}
                                                onClick={() => {
                                                    setSearchMode(searchMode === 'ai' ? 'normal' : 'ai');
                                                    setSearchQuery('');
                                                }}
                                                sx={{
                                                    background: searchMode === 'ai' ? 'transparent' : `linear-gradient(135deg, ${C.primary} 0%, ${C.dark} 100%)`,
                                                    color: searchMode === 'ai' ? C.primary : 'white',
                                                    fontWeight: 600,
                                                    fontSize: '0.8rem',
                                                    height: 28,
                                                    border: searchMode === 'ai' ? `1.5px solid ${C.primary}` : 'none',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        background: searchMode === 'ai' ? C.tint : `linear-gradient(135deg, ${C.dark} 0%, ${C.dark} 100%)`,
                                                        transform: 'scale(1.05)',
                                                    },
                                                    '& .MuiChip-icon': {
                                                        color: searchMode === 'ai' ? C.primary : 'white',
                                                        fontSize: 18
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Box sx={{ flexGrow: 1 }} />

                        {/* Ask AI Button */}
                        <Button
                            onClick={() => setChatOpen(o => !o)}
                            startIcon={<SmartToy sx={{ fontSize: 18 }} />}
                            variant={chatOpen ? 'contained' : 'outlined'}
                            size="small"
                            sx={{
                                mr: 2,
                                borderRadius: 2.5,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                px: 2,
                                py: 0.8,
                                ...(chatOpen ? {
                                    background: `linear-gradient(135deg, ${C.primary} 0%, ${C.dark} 100%)`,
                                    color: 'white',
                                    border: 'none',
                                    boxShadow: `0 4px 12px ${C.shadow}`,
                                } : {
                                    borderColor: C.primary,
                                    color: C.primary,
                                    bgcolor: C.tint,
                                    '&:hover': { bgcolor: '#bae6fd', borderColor: C.dark },
                                }),
                            }}
                        >
                            Ask AI
                        </Button>

                        <Typography variant="body2" sx={{ color: C.textSecondary, fontWeight: 500, mr: 2, fontSize: '0.82rem' }}>
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </Typography>

                        <IconButton
                            onClick={(e) => {
                                setAnchorEl(e.currentTarget);
                                setSelectedFile(null);
                            }}
                        >
                            <Avatar
                                sx={{
                                    background: `linear-gradient(135deg, ${C.primary} 0%, ${C.dark} 100%)`,
                                    width: 44,
                                    height: 44,
                                    fontWeight: 700,
                                    fontSize: '1.2rem'
                                }}
                            >
                                {(user?.firstName?.[0] || 'U').toUpperCase()}
                            </Avatar>
                        </IconButton>
                    </Toolbar>
                </AppBar>

                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            position: 'fixed',
                            top: 100,
                            right: 30,
                            zIndex: 1300,
                            minWidth: 350,
                            borderRadius: 3,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        }}
                        onClose={() => setError('')}
                    >
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert
                        severity="success"
                        sx={{
                            position: 'fixed',
                            top: 100,
                            right: 30,
                            zIndex: 1300,
                            minWidth: 350,
                            borderRadius: 3,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        }}
                        onClose={() => setSuccess('')}
                    >
                        {success}
                    </Alert>
                )}

                {/* Upload Progress Indicator */}
                {uploading && (
                    <Paper
                        elevation={8}
                        sx={{
                            position: 'fixed',
                            bottom: 140,
                            right: 40,
                            zIndex: 1300,
                            p: 3,
                            minWidth: 320,
                            borderRadius: 3,
                            boxShadow: `0 8px 32px ${C.shadow}`,
                            background: 'white',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <CloudUpload sx={{ color: C.primary, fontSize: 28 }} />
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1d2129', mb: 0.5 }}>
                                    Uploading...
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#6e7c87', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {uploadingFileName}
                                </Typography>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: C.primary }}>
                                {uploadProgress}%
                            </Typography>
                        </Box>
                        <Box sx={{ position: 'relative', height: 8, bgcolor: '#e8edf2', borderRadius: 4, overflow: 'hidden' }}>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    height: '100%',
                                    width: `${uploadProgress}%`,
                                    background: `linear-gradient(90deg, ${C.primary} 0%, ${C.dark} 100%)`,
                                    borderRadius: 4,
                                    transition: 'width 0.3s ease',
                                }}
                            />
                        </Box>
                    </Paper>
                )}

                <Box
                    sx={{ flexGrow: 1, overflow: 'auto', p: 4, bgcolor: C.bg, position: 'relative' }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {/* Drag & Drop Overlay */}
                    {isDragging && (
                        <Box sx={{
                            position: 'absolute', inset: 0, zIndex: 1200,
                            bgcolor: 'rgba(3,105,161,0.08)',
                            border: `3px dashed ${C.primary}`,
                            borderRadius: 3,
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            backdropFilter: 'blur(2px)',
                            pointerEvents: 'none',
                        }}>
                            <CloudUpload sx={{ fontSize: 64, color: C.primary, mb: 2, opacity: 0.8 }} />
                            <Typography variant="h5" sx={{ fontWeight: 700, color: C.primary }}>
                                Drop to upload
                            </Typography>
                            <Typography variant="body2" sx={{ color: C.textSecondary, mt: 0.5 }}>
                                Release to start uploading your file
                            </Typography>
                        </Box>
                    )}

                    <Box sx={{
                        mb: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: `linear-gradient(135deg, ${C.primary} 0%, ${C.dark} 100%)`,
                        borderRadius: 3,
                        px: 3.5,
                        py: 2.5,
                        color: 'white',
                    }}>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: 'white', mb: 0.3 }}>
                                {(() => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; })()}, {user?.firstName} 👋
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 400 }}>
                                {currentView === 'dashboard' && `You have ${files.filter(f => f.ownerEmail === user?.email).length} documents · AI-powered search is ready`}
                                {currentView === 'myDocuments' && 'All your uploaded documents'}
                                {currentView === 'shared' && 'Files shared with you by others'}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.12)', px: 2, py: 1, borderRadius: 2 }}>
                            <SmartToy sx={{ fontSize: 18, color: 'rgba(255,255,255,0.9)' }} />
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, fontSize: '0.78rem' }}>
                                AI Ready
                            </Typography>
                        </Box>
                    </Box>

                    {/* Stats Cards */}
                    <Box sx={{ display: 'flex', gap: 2.5, mb: 3.5 }}>
                        {[
                            {
                                label: 'Total Documents',
                                value: files.filter(f => f.ownerEmail === user?.email).length,
                                sub: 'in your library',
                                icon: <InsertDriveFile sx={{ fontSize: 24, color: C.primary }} />,
                                iconBg: C.tint,
                                accent: C.primary,
                            },
                            {
                                label: 'Uploaded Today',
                                value: files.filter(f => new Date(f.uploadedAt).toDateString() === new Date().toDateString() && f.ownerEmail === user?.email).length,
                                sub: 'new files',
                                icon: <CloudUpload sx={{ fontSize: 24, color: '#059669' }} />,
                                iconBg: '#ecfdf5',
                                accent: '#059669',
                            },
                            {
                                label: 'Storage Used',
                                value: getTotalSize(),
                                sub: 'AES-256 encrypted',
                                icon: <Folder sx={{ fontSize: 24, color: C.accent }} />,
                                iconBg: '#e0f2fe',
                                accent: C.accent,
                            },
                            {
                                label: 'Shared With Me',
                                value: files.filter(f => f.sharedWith?.includes(user?.email) && f.ownerEmail !== user?.email).length,
                                sub: 'from collaborators',
                                icon: <PeopleAlt sx={{ fontSize: 24, color: '#7c3aed' }} />,
                                iconBg: '#f5f3ff',
                                accent: '#7c3aed',
                            },
                        ].map((card, i) => (
                            <Paper
                                key={i}
                                elevation={0}
                                sx={{
                                    flex: 1,
                                    p: 3,
                                    borderRadius: 3,
                                    bgcolor: 'white',
                                    border: `1px solid ${C.border}`,
                                    borderTop: `3px solid ${card.accent}`,
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                                    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                                    '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 8px 24px ${C.shadow}` }
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: C.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                                            {card.label}
                                        </Typography>
                                        <Typography variant="h3" sx={{ fontWeight: 800, color: C.textPrimary, lineHeight: 1.1, mt: 0.5 }}>
                                            {card.value}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: C.textSecondary, fontSize: '0.72rem' }}>
                                            {card.sub}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ bgcolor: card.iconBg, p: 1.2, borderRadius: 2.5, display: 'flex', mt: 0.5 }}>
                                        {card.icon}
                                    </Box>
                                </Box>
                            </Paper>
                        ))}
                    </Box>

                    {/* Filter Section */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                            <InputLabel sx={{ color: C.textSecondary, '&.Mui-focused': { color: C.primary } }}>
                                File Type
                            </InputLabel>
                            <Select
                                value={fileTypeFilter}
                                label="File Type"
                                onChange={(e) => setFileTypeFilter(e.target.value)}
                                startAdornment={<InputAdornment position="start"><FilterList sx={{ fontSize: 18, color: C.primary, ml: 0.5 }} /></InputAdornment>}
                                sx={{
                                    borderRadius: 2,
                                    bgcolor: C.surface,
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: C.border },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: C.primary },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: C.primary },
                                }}
                            >
                                <MenuItem value="all">All Types</MenuItem>
                                <MenuItem value="pdf">PDF</MenuItem>
                                <MenuItem value="image">Images</MenuItem>
                                <MenuItem value="document">Documents</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel sx={{ color: C.textSecondary, '&.Mui-focused': { color: C.primary } }}>
                                Date Range
                            </InputLabel>
                            <Select
                                value={dateFilter}
                                label="Date Range"
                                onChange={(e) => setDateFilter(e.target.value)}
                                startAdornment={<InputAdornment position="start"><CalendarToday sx={{ fontSize: 16, color: C.primary, ml: 0.5 }} /></InputAdornment>}
                                sx={{
                                    borderRadius: 2,
                                    bgcolor: C.surface,
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: C.border },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: C.primary },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: C.primary },
                                }}
                            >
                                <MenuItem value="all">All Time</MenuItem>
                                <MenuItem value="today">Today</MenuItem>
                                <MenuItem value="week">This Week</MenuItem>
                                <MenuItem value="month">This Month</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 140 }}>
                            <InputLabel sx={{ color: C.textSecondary, '&.Mui-focused': { color: C.primary } }}>
                                Sort By
                            </InputLabel>
                            <Select
                                value={sortBy}
                                label="Sort By"
                                onChange={(e) => setSortBy(e.target.value)}
                                startAdornment={<InputAdornment position="start"><Sort sx={{ fontSize: 18, color: C.primary, ml: 0.5 }} /></InputAdornment>}
                                sx={{
                                    borderRadius: 2,
                                    bgcolor: C.surface,
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: C.border },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: C.primary },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: C.primary },
                                }}
                            >
                                <MenuItem value="newest">Newest First</MenuItem>
                                <MenuItem value="oldest">Oldest First</MenuItem>
                                <MenuItem value="largest">Largest First</MenuItem>
                                <MenuItem value="smallest">Smallest First</MenuItem>
                                <MenuItem value="name">Name A–Z</MenuItem>
                            </Select>
                        </FormControl>
                        {(fileTypeFilter !== 'all' || dateFilter !== 'all' || sortBy !== 'newest') && (
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => { setFileTypeFilter('all'); setDateFilter('all'); setSortBy('newest'); }}
                                sx={{
                                    borderRadius: 2, textTransform: 'none', fontWeight: 600,
                                    borderColor: '#ef4444', color: '#ef4444',
                                    '&:hover': { borderColor: '#dc2626', bgcolor: '#fff1f2' },
                                    fontSize: '0.8rem', px: 1.5, height: 40,
                                }}
                            >
                                Clear Filters
                            </Button>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1d2129' }}>
                                {getViewTitle()}
                            </Typography>
                            {searchMode === 'ai' && searchQuery && (
                                <Chip
                                    icon={<SmartToy />}
                                    label="AI Search Results"
                                    sx={{
                                        background: `linear-gradient(135deg, ${C.primary} 0%, ${C.dark} 100%)`,
                                        color: 'white',
                                        fontWeight: 600
                                    }}
                                />
                            )}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Chip
                                label={`${filteredFiles.length} files`}
                                sx={{
                                    bgcolor: C.primary,
                                    color: 'white',
                                    fontWeight: 600
                                }}
                            />
                            <Box sx={{ display: 'flex', border: `1px solid ${C.border}`, borderRadius: 2, overflow: 'hidden' }}>
                                <IconButton
                                    onClick={() => { setViewMode('grid'); localStorage.setItem('viewMode', 'grid'); }}
                                    aria-label="Grid view"
                                    sx={{
                                        borderRadius: 0, px: 1.5,
                                        bgcolor: viewMode === 'grid' ? C.primary : 'transparent',
                                        color: viewMode === 'grid' ? 'white' : C.textSecondary,
                                        '&:hover': { bgcolor: viewMode === 'grid' ? C.dark : C.tint }
                                    }}
                                >
                                    <ViewModule fontSize="small" />
                                </IconButton>
                                <Divider orientation="vertical" flexItem />
                                <IconButton
                                    onClick={() => { setViewMode('list'); localStorage.setItem('viewMode', 'list'); }}
                                    aria-label="List view"
                                    sx={{
                                        borderRadius: 0, px: 1.5,
                                        bgcolor: viewMode === 'list' ? C.primary : 'transparent',
                                        color: viewMode === 'list' ? 'white' : C.textSecondary,
                                        '&:hover': { bgcolor: viewMode === 'list' ? C.dark : C.tint }
                                    }}
                                >
                                    <ViewList fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>
                    </Box>

                    {/* Activity Feed View */}
                    {currentView === 'activity' && (
                        <Box>
                            {activityFeed.length === 0 ? (
                                <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: `1px solid ${C.border}` }}>
                                    <CalendarToday sx={{ fontSize: 48, color: C.border, mb: 2 }} />
                                    <Typography variant="h6" sx={{ color: C.textSecondary, fontWeight: 500 }}>No activity yet</Typography>
                                    <Typography variant="body2" sx={{ color: C.textSecondary, mt: 0.5 }}>Upload, preview, share or delete files to see activity here</Typography>
                                </Paper>
                            ) : (
                                <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                                    {activityFeed.map((item, i) => (
                                        <Box key={i} sx={{
                                            display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 2,
                                            borderBottom: i < activityFeed.length - 1 ? `1px solid ${C.border}` : 'none',
                                            bgcolor: i === 0 ? C.tint : 'white',
                                            transition: 'bgcolor 0.3s',
                                        }}>
                                            <Box sx={{
                                                width: 38, height: 38, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                                bgcolor: item.icon === 'upload' ? '#dcfce7' : item.icon === 'delete' ? '#fee2e2' : item.icon === 'share' ? C.tint : item.icon === 'rename' ? '#fef3c7' : '#f0f9ff',
                                            }}>
                                                {item.icon === 'upload' && <CloudUpload sx={{ fontSize: 18, color: '#16a34a' }} />}
                                                {item.icon === 'delete' && <Delete sx={{ fontSize: 18, color: '#dc2626' }} />}
                                                {item.icon === 'share' && <Share sx={{ fontSize: 18, color: C.primary }} />}
                                                {item.icon === 'preview' && <Search sx={{ fontSize: 18, color: C.accent }} />}
                                                {item.icon === 'download' && <Download sx={{ fontSize: 18, color: C.primary }} />}
                                                {item.icon === 'rename' && <Edit sx={{ fontSize: 18, color: '#d97706' }} />}
                                            </Box>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: C.textPrimary }}>
                                                    {item.action}{' '}
                                                    <Box component="span" sx={{ fontWeight: 400, color: C.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {item.fileName}
                                                    </Box>
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" sx={{ color: C.textSecondary, flexShrink: 0 }}>
                                                {item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Paper>
                            )}
                        </Box>
                    )}

                    {/* Claude AI Answer Panel */}
                    {aiAnswer && searchMode === 'ai' && (
                        <Paper
                            elevation={0}
                            sx={{
                                mb: 3,
                                p: 3,
                                borderRadius: 3,
                                border: `1.5px solid ${C.primary}`,
                                background: `linear-gradient(135deg, rgba(0,53,102,0.04) 0%, rgba(0,29,61,0.04) 100%)`,
                                boxShadow: `0 2px 12px ${C.shadow}`,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                <SmartToy sx={{ color: C.primary, fontSize: 22 }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: C.primary }}>
                                    AI Answer
                                </Typography>
                                <Chip
                                    label="AI Generated"
                                    size="small"
                                    sx={{ bgcolor: C.tint, color: C.primary, fontWeight: 600, fontSize: '0.7rem', height: 20 }}
                                />
                            </Box>
                            <Typography variant="body2" sx={{ color: C.textPrimary, lineHeight: 1.7 }}>
                                {aiAnswer}
                            </Typography>
                        </Paper>
                    )}

                    {loading || aiSearching ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
                            <CircularProgress sx={{ color: C.primary }} size={60} />
                            {aiSearching && (
                                <Typography variant="body1" sx={{ mt: 2, color: '#6e7c87', fontWeight: 500 }}>
                                    🤖 AI is analyzing your documents...
                                </Typography>
                            )}
                        </Box>
                    ) : filteredFiles.length === 0 ? (
                        <Paper
                            elevation={0}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            sx={{
                                p: { xs: 6, md: 10 },
                                textAlign: 'center',
                                borderRadius: 4,
                                border: isDragging ? `2px dashed ${C.primary}` : '2px dashed #cbd5e1',
                                background: isDragging
                                    ? `linear-gradient(135deg, rgba(3,105,161,0.07) 0%, rgba(14,165,233,0.07) 100%)`
                                    : `linear-gradient(135deg, rgba(248,250,252,1) 0%, rgba(224,242,254,0.4) 100%)`,
                                transition: 'all 0.2s ease',
                                cursor: 'default',
                            }}
                        >
                            {!searchQuery && (fileTypeFilter === 'all') && (dateFilter === 'all') && currentView !== 'shared' ? (
                                <>
                                    <Box sx={{ mb: 2 }}>
                                        <CloudUpload sx={{ fontSize: 72, color: isDragging ? C.primary : '#94a3b8', transition: 'color 0.2s ease' }} />
                                    </Box>
                                    <Typography variant="h5" sx={{ fontWeight: 700, color: isDragging ? C.primary : C.textPrimary, mb: 1 }}>
                                        {isDragging ? 'Drop to upload' : 'No documents yet'}
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: C.textSecondary }}>
                                        Drag & drop files here, or use the <strong style={{ color: C.primary }}>+ Upload</strong> button
                                    </Typography>
                                </>
                            ) : (
                                <>
                                    <Folder sx={{ fontSize: 72, color: '#94a3b8', mb: 2 }} />
                                    <Typography variant="h5" sx={{ fontWeight: 700, color: C.textPrimary, mb: 1 }}>
                                        {searchMode === 'ai' && searchQuery ? 'No matching documents found' :
                                            searchQuery ? 'No files match your search' :
                                                currentView === 'shared' ? 'No shared files yet' :
                                                    'No files match your filters'}
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: C.textSecondary }}>
                                        {searchMode === 'ai' && searchQuery ? 'Try a different query or switch to Normal search' :
                                            searchQuery || fileTypeFilter !== 'all' || dateFilter !== 'all' ? 'Try adjusting your filters or search terms' :
                                                'Files shared with you will appear here'}
                                    </Typography>
                                </>
                            )}
                        </Paper>
                    ) : viewMode === 'grid' ? (
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: 3,
                                mb: 12,
                            }}
                        >
                            {filteredFiles.map((file) => {
                                const isPdf = file.fileType?.includes('pdf');
                                const isImage = file.fileType?.includes('image');
                                const isText = file.fileType?.includes('text') || file.fileType?.includes('word') || file.fileType?.includes('document');
                                const fileColor = isPdf ? '#ef4444' : isImage ? '#10b981' : isText ? C.primary : '#94a3b8';
                                const fileBg = isPdf
                                    ? 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)'
                                    : isImage
                                    ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
                                    : isText
                                    ? `linear-gradient(135deg, ${C.tint} 0%, #bae6fd 100%)`
                                    : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
                                const ext = file.originalFileName?.split('.').pop()?.toUpperCase() || 'FILE';

                                return (
                                <Paper
                                    key={file.id}
                                    elevation={0}
                                    role="article"
                                    aria-label={`Document: ${file.originalFileName}`}
                                    sx={{
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        border: `1px solid ${C.border}`,
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                        transition: 'all 0.22s ease',
                                        '&:hover': {
                                            boxShadow: `0 10px 32px ${C.shadowHover}`,
                                            transform: 'translateY(-4px)',
                                            borderColor: fileColor + '55',
                                        },
                                        '&:focus-within': {
                                            outline: `2px solid ${C.primary}`,
                                            outlineOffset: 2,
                                        },
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    {/* Thumbnail */}
                                    <Box
                                        onClick={() => handleOpenFile(file)}
                                        tabIndex={0}
                                        aria-label={`Open ${file.originalFileName}`}
                                        onKeyDown={(e) => e.key === 'Enter' && handleOpenFile(file)}
                                        sx={{
                                            height: 160,
                                            background: fileBg,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'relative',
                                            gap: 1,
                                            '&:focus': { outline: 'none' },
                                        }}
                                    >
                                        {/* File type icon */}
                                        <Box sx={{
                                            width: 60, height: 60, borderRadius: 3,
                                            bgcolor: 'white',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
                                        }}>
                                            {isImage
                                                ? <Image sx={{ fontSize: 32, color: fileColor }} />
                                                : isPdf
                                                ? <PictureAsPdf sx={{ fontSize: 32, color: fileColor }} />
                                                : isText
                                                ? <Description sx={{ fontSize: 32, color: fileColor }} />
                                                : <InsertDriveFile sx={{ fontSize: 32, color: fileColor }} />
                                            }
                                        </Box>
                                        {/* Extension badge */}
                                        <Box sx={{
                                            bgcolor: fileColor, color: 'white',
                                            px: 1.2, py: 0.2, borderRadius: 1,
                                            fontSize: '0.65rem', fontWeight: 700, letterSpacing: 0.5,
                                        }}>
                                            {ext}
                                        </Box>

                                        {/* Shared badge */}
                                        {file.ownerEmail !== user?.email && (
                                            <Chip label="Shared" size="small" sx={{
                                                position: 'absolute', top: 10, left: 10,
                                                bgcolor: 'white', color: C.primary,
                                                fontWeight: 700, fontSize: '0.68rem', height: 22,
                                                border: `1px solid ${C.primary}22`,
                                                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                                            }} />
                                        )}

                                        {/* Hover quick-action overlay */}
                                        <Box sx={{
                                            position: 'absolute', inset: 0,
                                            bgcolor: 'rgba(3,105,161,0.08)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                                            opacity: 0, transition: 'opacity 0.2s ease',
                                            '&:hover': { opacity: 1 },
                                        }}>
                                            <IconButton
                                                size="small" aria-label="Preview"
                                                onClick={(e) => { e.stopPropagation(); handleOpenFile(file); }}
                                                sx={{ bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', '&:hover': { bgcolor: C.tint } }}
                                            >
                                                <Visibility sx={{ fontSize: 18, color: C.primary }} />
                                            </IconButton>
                                            <IconButton
                                                size="small" aria-label="Download"
                                                onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                                                sx={{ bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', '&:hover': { bgcolor: C.tint } }}
                                            >
                                                <Download sx={{ fontSize: 18, color: C.primary }} />
                                            </IconButton>
                                        </Box>
                                    </Box>

                                    {/* Card body */}
                                    <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography
                                                variant="subtitle2"
                                                title={file.originalFileName}
                                                sx={{
                                                    fontWeight: 700,
                                                    color: C.textPrimary,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    flex: 1,
                                                    mr: 0.5,
                                                    fontSize: '0.9rem',
                                                }}
                                            >
                                                {file.originalFileName}
                                            </Typography>

                                            {/* Actions */}
                                            <Box sx={{ display: 'flex', gap: 0.3, flexShrink: 0 }}>
                                                {(file.keywords?.length > 0 || file.summary) && (
                                                    <IconButton
                                                        size="small"
                                                        aria-label={expandedFiles.has(file.id) ? 'Collapse details' : 'Expand details'}
                                                        onClick={(e) => { e.stopPropagation(); toggleFileExpand(file.id); }}
                                                        sx={{
                                                            color: C.primary,
                                                            transform: expandedFiles.has(file.id) ? 'rotate(180deg)' : 'rotate(0deg)',
                                                            transition: 'transform 0.25s ease',
                                                            '&:hover': { bgcolor: C.tint },
                                                        }}
                                                    >
                                                        <ExpandMore fontSize="small" />
                                                    </IconButton>
                                                )}
                                                <IconButton
                                                    size="small"
                                                    aria-label="More options"
                                                    sx={{ color: C.textSecondary, '&:hover': { bgcolor: C.tint, color: C.primary } }}
                                                    onClick={(e) => handleMenuOpen(e, file)}
                                                >
                                                    <MoreVert fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Box>

                                        {/* Metadata row */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                                            <Typography variant="caption" sx={{
                                                color: 'white', bgcolor: fileColor, px: 1, py: 0.2,
                                                borderRadius: 1, fontWeight: 600, fontSize: '0.68rem',
                                            }}>
                                                {formatFileSize(file.fileSize)}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: C.textSecondary, fontSize: '0.75rem' }}>
                                                {new Date(file.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </Typography>
                                            {file.ownerEmail !== user?.email && (
                                                <Typography variant="caption" sx={{ color: C.textSecondary, fontSize: '0.72rem' }}>
                                                    · {file.ownerEmail}
                                                </Typography>
                                            )}
                                        </Box>

                                        {/* Expanded: Keywords */}
                                        {expandedFiles.has(file.id) && file.keywords?.length > 0 && (
                                            <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${C.border}`, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {file.keywords.slice(0, 4).map((kw, idx) => (
                                                    <Chip key={idx} label={kw} size="small" sx={{
                                                        bgcolor: C.tint, color: C.primary,
                                                        fontWeight: 600, fontSize: '0.65rem', height: 20,
                                                        '& .MuiChip-label': { px: 1 }
                                                    }} />
                                                ))}
                                                {file.keywords.length > 4 && (
                                                    <Chip label={`+${file.keywords.length - 4}`} size="small" sx={{
                                                        bgcolor: '#f1f5f9', color: C.textSecondary,
                                                        fontWeight: 600, fontSize: '0.65rem', height: 20,
                                                        '& .MuiChip-label': { px: 1 }
                                                    }} />
                                                )}
                                            </Box>
                                        )}

                                        {/* Expanded: Summary */}
                                        {expandedFiles.has(file.id) && file.summary && (
                                            <Typography variant="caption" sx={{
                                                color: C.textSecondary, display: '-webkit-box',
                                                mt: 1, lineHeight: 1.5,
                                                overflow: 'hidden', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                                            }}>
                                                {file.summary}
                                            </Typography>
                                        )}
                                    </Box>
                                </Paper>
                                );
                            })}
                        </Box>
                    ) : (
                        <Paper
                            elevation={0}
                            sx={{
                                borderRadius: 4,
                                overflow: 'hidden',
                                border: '1px solid #e8edf2',
                                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                                mb: 12,
                            }}
                        >
                            {filteredFiles.map((file, index) => (
                                <Box key={file.id}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            p: 3,
                                            borderBottom: index < filteredFiles.length - 1 ? '1px solid #e8edf2' : 'none',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                bgcolor: '#f7f9fc',
                                            },
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 64,
                                                height: 64,
                                                borderRadius: 3,
                                                bgcolor: file.fileType?.includes('pdf') ? '#ffebee' :
                                                    file.fileType?.includes('image') ? '#e8f5e9' :
                                                        file.fileType?.includes('text') ? '#e3f2fd' : '#f5f5f5',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mr: 3,
                                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                            }}
                                        >
                                            {getFileIcon(file.fileType)}
                                        </Box>

                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1d2129', mb: 0.5 }}>
                                                {file.originalFileName}
                                                {file.ownerEmail !== user?.email && (
                                                    <Chip
                                                        label="Shared"
                                                        size="small"
                                                        sx={{
                                                            ml: 1,
                                                            bgcolor: '#e3f2fd',
                                                            color: '#1976d2',
                                                            fontWeight: 600,
                                                            fontSize: '0.7rem'
                                                        }}
                                                    />
                                                )}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#6e7c87' }}>
                                                {formatFileSize(file.fileSize)} • {new Date(file.uploadedAt).toLocaleDateString()}
                                                {file.ownerEmail !== user?.email && ` • Owner: ${file.ownerEmail}`}
                                            </Typography>
                                        </Box>

                                        {/* Expand/Collapse Icon */}
                                        {(file.keywords?.length > 0 || file.summary) && (
                                            <IconButton
                                                onClick={(e) => { e.stopPropagation(); toggleFileExpand(file.id); }}
                                                size="small"
                                                sx={{
                                                    mr: 3,  // Increased from 2 to 3 for more space
                                                    color: C.primary,
                                                    transform: expandedFiles.has(file.id) ? 'rotate(180deg)' : 'rotate(0deg)',
                                                    transition: 'transform 0.3s ease',
                                                    '&:hover': {
                                                        bgcolor: C.tint,
                                                    },
                                                    '& .MuiSvgIcon-root': {
                                                        fontSize: 32,
                                                        fontWeight: 'bold',
                                                    }
                                                }}
                                            >
                                                <ExpandMore />
                                            </IconButton>
                                        )}

                                        <Button
                                            variant="contained"
                                            sx={{
                                                background: `linear-gradient(135deg, ${C.primary} 0%, ${C.dark} 100%)`,
                                                color: 'white',
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                px: 3,
                                                borderRadius: 2,
                                                mr: 2,
                                                boxShadow: `0 4px 12px ${C.shadow}`,
                                                '&:hover': {
                                                    background: `linear-gradient(135deg, ${C.dark} 0%, ${C.dark} 100%)`,
                                                    boxShadow: `0 6px 16px ${C.shadowHover}`,
                                                }
                                            }}
                                            onClick={() => handleOpenFile(file)}
                                        >
                                            Open
                                        </Button>
                                        <IconButton
                                            sx={{
                                                bgcolor: '#f7f9fc',
                                                '&:hover': { bgcolor: '#e8edf2' }
                                            }}
                                            onClick={(e) => handleMenuOpen(e, file)}
                                        >
                                            <MoreVert />
                                        </IconButton>
                                    </Box>

                                    {/* 🆕 Expanded Section with Keywords & Summary */}
                                    {expandedFiles.has(file.id) && (file.keywords?.length > 0 || file.summary) && (
                                        <Box
                                            sx={{
                                                px: 4,
                                                pb: 4,
                                                pt: 1.5,
                                                bgcolor: '#f7f9fc',
                                                borderBottom: index < filteredFiles.length - 1 ? '1px solid #e8edf2' : 'none',
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    bgcolor: 'white',
                                                    borderRadius: 2,
                                                    p: 2.5,
                                                    border: '1px solid #e8edf2',
                                                }}
                                            >
                                                {/* Keywords */}
                                                {file.keywords && file.keywords.length > 0 && (
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="caption" sx={{ fontWeight: 700, color: C.primary, mb: 1, display: 'block' }}>
                                                            🏷️ KEYWORDS
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                                                            {file.keywords.map((keyword, idx) => (
                                                                <Chip
                                                                    key={idx}
                                                                    label={keyword}
                                                                    size="small"
                                                                    sx={{
                                                                        bgcolor: '#E3F2FD',
                                                                        color: C.primary,
                                                                        fontWeight: 600,
                                                                        fontSize: '0.75rem',
                                                                        '&:hover': {
                                                                            bgcolor: '#FFE082',
                                                                        }
                                                                    }}
                                                                />
                                                            ))}
                                                        </Box>
                                                    </Box>
                                                )}

                                                {/* Summary */}
                                                {file.summary && (
                                                    <Box>
                                                        <Typography variant="caption" sx={{ fontWeight: 700, color: C.primary, mb: 0.5, display: 'block' }}>
                                                            📝 SUMMARY
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: '#6e7c87',
                                                                lineHeight: 1.6,
                                                                fontStyle: 'italic',
                                                            }}
                                                        >
                                                            {file.summary}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            ))}
                        </Paper>
                    )}
                </Box>
            </Box>

            <Box sx={{ position: 'fixed', bottom: 40, right: 40 }}>
                {/* Pulsing ring animation */}
                {!uploading && (
                    <Box sx={{
                        position: 'absolute',
                        inset: -6,
                        borderRadius: 10,
                        border: `2px solid ${C.accentFab}`,
                        opacity: 0.5,
                        animation: 'fabPulse 2s ease-in-out infinite',
                        '@keyframes fabPulse': {
                            '0%': { transform: 'scale(1)', opacity: 0.5 },
                            '50%': { transform: 'scale(1.12)', opacity: 0.15 },
                            '100%': { transform: 'scale(1)', opacity: 0.5 },
                        },
                        pointerEvents: 'none',
                    }} />
                )}
                <Fab
                    color="primary"
                    component="label"
                    variant="extended"
                    sx={{
                        background: `linear-gradient(135deg, ${C.accentFab} 0%, ${C.accentFabHover} 100%)`,
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        px: 3,
                        height: 56,
                        boxShadow: `0 6px 20px rgba(14,165,233,0.45)`,
                        '&:hover': {
                            background: `linear-gradient(135deg, ${C.accentFabHover} 0%, ${C.accentFabHover} 100%)`,
                            transform: 'scale(1.07)',
                            boxShadow: `0 8px 28px rgba(14,165,233,0.55)`,
                        },
                        transition: 'all 0.3s ease',
                    }}
                    disabled={uploading}
                >
                    <input type="file" hidden ref={fileInputRef} onChange={handleFileInputChange} />
                    {uploading
                        ? <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
                        : <Add sx={{ fontSize: 26, mr: 0.5 }} />
                    }
                    Upload
                </Fab>
            </Box>


            {/* Chat Panel */}
            {chatOpen && (
                <Paper elevation={12} sx={{
                    position: 'fixed', top: 76, right: 24,
                    width: 380, height: 520,
                    borderRadius: 4,
                    display: 'flex', flexDirection: 'column',
                    overflow: 'hidden',
                    zIndex: 1400,
                    boxShadow: `0 16px 48px rgba(3,105,161,0.25)`,
                    border: `1px solid ${C.border}`,
                }}>
                    {/* Header */}
                    <Box sx={{
                        background: `linear-gradient(135deg, ${C.primary} 0%, ${C.dark} 100%)`,
                        px: 2.5, py: 2,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <SmartToy sx={{ color: 'white', fontSize: 22 }} />
                            <Box>
                                <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 700, lineHeight: 1.1 }}>
                                    Ask your documents
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }}>
                                    Powered by Claude AI
                                </Typography>
                            </Box>
                        </Box>
                        <IconButton size="small" onClick={() => setChatOpen(false)} sx={{ color: 'white' }}>
                            <ExpandMore sx={{ transform: 'rotate(-90deg)' }} />
                        </IconButton>
                    </Box>

                    {/* Messages */}
                    <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {chatMessages.map((msg, i) => (
                            <Box key={i} sx={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                {msg.role === 'ai' && (
                                    <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1, flexShrink: 0, mt: 0.3 }}>
                                        <SmartToy sx={{ fontSize: 16, color: 'white' }} />
                                    </Box>
                                )}
                                <Box sx={{
                                    maxWidth: '78%',
                                    px: 2, py: 1.2,
                                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                    bgcolor: msg.role === 'user' ? C.primary : 'white',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                                    border: msg.role === 'ai' ? `1px solid ${C.border}` : 'none',
                                }}>
                                    <Typography variant="body2" sx={{ color: msg.role === 'user' ? 'white' : C.textPrimary, lineHeight: 1.6 }}>
                                        {msg.text}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                        {chatLoading && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <SmartToy sx={{ fontSize: 16, color: 'white' }} />
                                </Box>
                                <Box sx={{ px: 2, py: 1.2, bgcolor: 'white', borderRadius: '16px 16px 16px 4px', border: `1px solid ${C.border}` }}>
                                    <CircularProgress size={16} sx={{ color: C.primary }} />
                                </Box>
                            </Box>
                        )}
                        <div ref={chatBottomRef} />
                    </Box>

                    {/* Input */}
                    <Box sx={{ p: 2, borderTop: `1px solid ${C.border}`, bgcolor: 'white', display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Ask about your documents..."
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleChatSend()}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <IconButton
                            onClick={handleChatSend}
                            disabled={chatLoading || !chatInput.trim()}
                            sx={{
                                bgcolor: C.primary, color: 'white', borderRadius: 2,
                                '&:hover': { bgcolor: C.dark },
                                '&:disabled': { bgcolor: C.border },
                            }}
                        >
                            <Search />
                        </IconButton>
                    </Box>
                </Paper>
            )}

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl) && Boolean(selectedFile)}
                onClose={handleMenuClose}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        minWidth: 200,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    }
                }}
            >
                <MenuItem
                    onClick={() => {
                        setNewFileName(selectedFile?.originalFileName || '');
                        setRenameDialogOpen(true);
                    }}
                    sx={{ py: 1.5 }}
                >
                    <Edit sx={{ mr: 2, fontSize: 22, color: C.primary }} />
                    <Typography sx={{ fontWeight: 500 }}>Rename</Typography>
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        setShareDialogOpen(true);
                    }}
                    sx={{ py: 1.5 }}
                >
                    <Share sx={{ mr: 2, fontSize: 22, color: C.primary }} />
                    <Typography sx={{ fontWeight: 500 }}>Share</Typography>
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        if (selectedFile) handleDownload(selectedFile);
                        handleMenuClose();
                    }}
                    sx={{ py: 1.5 }}
                >
                    <Download sx={{ mr: 2, fontSize: 22, color: C.primary }} />
                    <Typography sx={{ fontWeight: 500 }}>Download</Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleDelete} sx={{ py: 1.5, color: 'error.main' }}>
                    <Delete sx={{ mr: 2, fontSize: 22 }} />
                    <Typography sx={{ fontWeight: 500 }}>Delete</Typography>
                </MenuItem>
            </Menu>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl) && !selectedFile}
                onClose={handleMenuClose}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        minWidth: 280,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ px: 3, py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar
                            sx={{
                                background: `linear-gradient(135deg, ${C.primary} 0%, ${C.dark} 100%)`,
                                width: 56,
                                height: 56,
                                fontSize: '1.5rem',
                                fontWeight: 700
                            }}
                        >
                            {(user?.firstName?.[0] || 'U').toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {user?.firstName} {user?.lastName}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {user?.email}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ py: 2, px: 3 }}>
                    <Logout sx={{ mr: 2, fontSize: 22, color: C.primary }} />
                    <Typography sx={{ fontWeight: 600 }}>Logout</Typography>
                </MenuItem>
            </Menu>

            {/* Document Preview Dialog */}
            <Dialog
                open={Boolean(previewFile)}
                onClose={() => {
                    if (previewUrl) window.URL.revokeObjectURL(previewUrl);
                    setPreviewFile(null);
                    setPreviewUrl(null);
                }}
                maxWidth="lg"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden', height: '85vh' } }}
            >
                <DialogTitle sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: `linear-gradient(135deg, ${C.primary} 0%, ${C.dark} 100%)`,
                    color: 'white', py: 2, px: 3,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {previewFile?.fileType?.includes('pdf') && <PictureAsPdf sx={{ color: '#fca5a5' }} />}
                        {previewFile?.fileType?.includes('image') && <Image sx={{ color: '#86efac' }} />}
                        {previewFile?.fileType?.includes('text') && <Description sx={{ color: '#93c5fd' }} />}
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'white' }}>
                            {previewFile?.originalFileName}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            size="small"
                            startIcon={<Download />}
                            onClick={() => handleDownload(previewFile)}
                            sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', border: '1px solid', borderRadius: 2, textTransform: 'none' }}
                        >
                            Download
                        </Button>
                        <IconButton size="small" onClick={() => { if (previewUrl) window.URL.revokeObjectURL(previewUrl); setPreviewFile(null); setPreviewUrl(null); }} sx={{ color: 'white' }}>
                            <Delete sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 0, bgcolor: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {previewFile?.fileType?.includes('image') && (
                        <img src={previewUrl} alt={previewFile.originalFileName} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    )}
                    {(previewFile?.fileType?.includes('pdf') || previewFile?.fileType?.includes('text')) && (
                        <iframe src={previewUrl} title={previewFile?.originalFileName} style={{ width: '100%', height: '100%', border: 'none', background: 'white' }} />
                    )}
                </DialogContent>
            </Dialog>

            <Dialog
                open={shareDialogOpen}
                onClose={() => {
                    setShareDialogOpen(false);
                    setShareEmail('');
                    handleMenuClose();
                }}
                PaperProps={{
                    sx: { borderRadius: 3, minWidth: 450 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, fontSize: '1.5rem', pb: 1 }}>
                    Share File
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        File: <strong>{selectedFile?.originalFileName}</strong>
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                        Enter the email address of the person you want to share with
                    </Typography>
                    <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                        placeholder="user@example.com"
                        autoFocus
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Email sx={{ color: C.primary }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={() => {
                            setShareDialogOpen(false);
                            setShareEmail('');
                        }}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            color: '#6e7c87'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleShareFile}
                        variant="contained"
                        disabled={!shareEmail}
                        sx={{
                            background: `linear-gradient(135deg, ${C.primary} 0%, ${C.dark} 100%)`,
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3,
                            borderRadius: 2,
                            boxShadow: `0 4px 12px ${C.shadow}`,
                            '&:hover': {
                                background: `linear-gradient(135deg, ${C.dark} 0%, ${C.dark} 100%)`,
                                boxShadow: `0 6px 16px ${C.shadowHover}`,
                            }
                        }}
                    >
                        Share
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={renameDialogOpen}
                onClose={() => {
                    setRenameDialogOpen(false);
                    setNewFileName('');
                    handleMenuClose();
                }}
                PaperProps={{
                    sx: { borderRadius: 3, minWidth: 450 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, fontSize: '1.5rem', pb: 1 }}>
                    Rename File
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        Current name: <strong>{selectedFile?.originalFileName}</strong>
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                        Enter a new name for this file
                    </Typography>
                    <TextField
                        fullWidth
                        label="New File Name"
                        type="text"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        placeholder="document.pdf"
                        autoFocus
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Edit sx={{ color: C.primary }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={() => {
                            setRenameDialogOpen(false);
                            setNewFileName('');
                        }}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            color: '#6e7c87'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleRenameFile}
                        variant="contained"
                        disabled={!newFileName || newFileName === selectedFile?.originalFileName}
                        sx={{
                            background: `linear-gradient(135deg, ${C.primary} 0%, ${C.dark} 100%)`,
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3,
                            borderRadius: 2,
                            boxShadow: `0 4px 12px ${C.shadow}`,
                            '&:hover': {
                                background: `linear-gradient(135deg, ${C.dark} 0%, ${C.dark} 100%)`,
                                boxShadow: `0 6px 16px ${C.shadowHover}`,
                            }
                        }}
                    >
                        Rename
                    </Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
};

export default Dashboard;