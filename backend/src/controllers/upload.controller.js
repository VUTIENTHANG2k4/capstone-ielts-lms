const supabase = require('../config/supabase');
const path = require('path');
const crypto = require('crypto');

const ALLOWED_MIME = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
  document: ['application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

const ALL_ALLOWED = [
  ...ALLOWED_MIME.image,
  ...ALLOWED_MIME.video,
  ...ALLOWED_MIME.audio,
  ...ALLOWED_MIME.document,
];

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

const BUCKET = 'lms-uploads';

/**
 * POST /api/upload
 * Uploads a file to Supabase Storage and returns the public URL.
 */
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Không có file nào được gửi lên.' });
    }

    const { mimetype, buffer, originalname, size } = req.file;

    if (!ALL_ALLOWED.includes(mimetype)) {
      return res.status(400).json({ error: `Định dạng file không được hỗ trợ: ${mimetype}` });
    }

    if (size > MAX_SIZE) {
      return res.status(400).json({ error: 'File quá lớn. Giới hạn 50MB.' });
    }

    // Generate a safe filename
    const ext = path.extname(originalname);
    const hash = crypto.randomBytes(8).toString('hex');
    const folder = getFolder(mimetype);
    const filePath = `${folder}/${Date.now()}-${hash}${ext}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: mimetype,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ error: 'Upload file thất bại. Vui lòng thử lại.' });
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);

    res.json({
      url: urlData.publicUrl,
      path: data.path,
      filename: originalname,
      mimetype,
      size,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload file thất bại.' });
  }
};

function getFolder(mimetype) {
  if (ALLOWED_MIME.image.includes(mimetype)) return 'images';
  if (ALLOWED_MIME.video.includes(mimetype)) return 'videos';
  if (ALLOWED_MIME.audio.includes(mimetype)) return 'audio';
  return 'documents';
}

/**
 * DELETE /api/upload
 * Deletes a file from Supabase Storage by path.
 */
const deleteFile = async (req, res) => {
  try {
    const { filePath } = req.body;
    if (!filePath) return res.status(400).json({ error: 'Thiếu đường dẫn file.' });

    const { error } = await supabase.storage.from(BUCKET).remove([filePath]);
    if (error) throw error;

    res.json({ message: 'Đã xóa file.' });
  } catch (err) {
    console.error('Delete file error:', err);
    res.status(500).json({ error: 'Xóa file thất bại.' });
  }
};

module.exports = { uploadFile, deleteFile };
