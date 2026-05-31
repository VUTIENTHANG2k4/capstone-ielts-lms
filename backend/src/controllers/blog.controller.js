const supabase = require('../config/supabase');

// Helper: generate unique slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-') + '-' + Date.now();
};

const getPosts = async (req, res) => {
  try {
    const { category, page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('core_ielts_lms_blog_posts')
      .select(`
        id, title, slug, excerpt, thumbnail_url, category, tags,
        status, views_count, published_at, created_at,
        core_ielts_lms_users!author_id (id, full_name, avatar_url)
      `, { count: 'exact' })
      .order('published_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    // Public users only see published posts
    if (!req.user || req.user.role === 'student') {
      query = query.eq('status', 'published');
    } else if (status) {
      query = query.eq('status', status);
    }

    if (category) query = query.eq('category', category);

    const { data, count, error } = await query;
    if (error) throw error;

    res.json({
      posts: data,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(count / limit) }
    });
  } catch (err) {
    console.error('Get posts error:', err);
    res.status(500).json({ error: 'Không thể tải danh sách bài viết.' });
  }
};

const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const { data: post, error } = await supabase
      .from('core_ielts_lms_blog_posts')
      .select(`
        *,
        core_ielts_lms_users!author_id (id, full_name, avatar_url)
      `)
      .eq('slug', slug)
      .single();

    if (error || !post) {
      return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
    }

    // Public can only see published posts
    if (post.status !== 'published' && (!req.user || req.user.role === 'student')) {
      return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
    }

    // Increment view count (fire and forget)
    supabase
      .from('core_ielts_lms_blog_posts')
      .update({ views_count: (post.views_count || 0) + 1 })
      .eq('id', post.id)
      .then(() => {});

    res.json({ post });
  } catch (err) {
    console.error('Get post error:', err);
    res.status(500).json({ error: 'Không thể tải thông tin bài viết.' });
  }
};

const createPost = async (req, res) => {
  try {
    const { title, excerpt, content, thumbnail_url, category, tags, status } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Vui lòng nhập tiêu đề và nội dung bài viết.' });
    }

    const slug = generateSlug(title);
    const published_at = status === 'published' ? new Date().toISOString() : null;

    const { data, error } = await supabase
      .from('core_ielts_lms_blog_posts')
      .insert({
        title,
        slug,
        excerpt,
        content,
        thumbnail_url,
        category,
        tags: tags || [],
        status: status || 'draft',
        author_id: req.user.id,
        published_at
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ post: data });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ error: 'Tạo bài viết thất bại. Vui lòng thử lại.' });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Set published_at when publishing for first time
    if (updates.status === 'published') {
      const { data: existing } = await supabase
        .from('core_ielts_lms_blog_posts')
        .select('published_at')
        .eq('id', id)
        .single();
      if (!existing?.published_at) {
        updates.published_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from('core_ielts_lms_blog_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Không tìm thấy bài viết.' });

    res.json({ post: data });
  } catch (err) {
    console.error('Update post error:', err);
    res.status(500).json({ error: 'Cập nhật bài viết thất bại. Vui lòng thử lại.' });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('core_ielts_lms_blog_posts').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Đã xóa bài viết thành công.' });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({ error: 'Xóa bài viết thất bại. Vui lòng thử lại.' });
  }
};

module.exports = { getPosts, getPostBySlug, createPost, updatePost, deletePost };
