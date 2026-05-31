require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./utils/errors');
const { initRealtime } = require('./services/realtime.service');

const app = express();
const server = http.createServer(app);

// Render/Vercel đứng sau reverse proxy → tin tưởng 1 lớp proxy để
// express-rate-limit lấy đúng IP thật từ X-Forwarded-For (tránh
// ValidationError ERR_ERL_UNEXPECTED_X_FORWARDED_FOR và gom nhầm key).
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS - allow configured origin(s) plus common dev ports
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'https://ielts-thangvu.vercel.app'
].filter(Boolean);

initRealtime(server, allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true, // Chỉ đếm request thất bại
  message: { error: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.' }
});

app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '2.0.0' });
});

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth.routes'));
app.use('/api/courses', require('./routes/course.routes'));
app.use('/api/units', require('./routes/unit.routes'));
app.use('/api/sections', require('./routes/section.routes'));
app.use('/api/lessons', require('./routes/lesson.routes'));
app.use('/api/activities', require('./routes/activity.routes'));
app.use('/api/mock-tests', require('./routes/mockTest.routes'));
app.use('/api/submissions', require('./routes/submission.routes'));
app.use('/api/progress', require('./routes/progress.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/blog', require('./routes/blog.routes'));
app.use('/api/vocabulary', require('./routes/vocabulary.routes'));
app.use('/api/notes', require('./routes/note.routes'));
app.use('/api/leaderboard', require('./routes/leaderboard.routes'));
app.use('/api/certificates', require('./routes/certificate.routes'));
app.use('/api/teacher', require('./routes/teacher.routes'));
app.use('/api/classes', require('./routes/class.routes'));
app.use('/api/packages', require('./routes/package.routes'));
app.use('/api/payment', require('./routes/payment.routes'));
app.use('/api/upload', require('./routes/upload.routes'));

// Error handler
app.use(errorHandler);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Đường dẫn không tồn tại.' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`IELTS Academy LMS API running on port ${PORT}`);
});

module.exports = { app, server };
