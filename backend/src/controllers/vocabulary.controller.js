const supabase = require('../config/supabase');

// ---- VOCABULARY LISTS ----

const getMyLists = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('core_ielts_lms_vocabulary_lists')
      .select(`
        *,
        item_count:core_ielts_lms_vocabulary_items(count)
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ lists: data });
  } catch (err) {
    console.error('Get vocab lists error:', err);
    res.status(500).json({ error: 'Không thể tải danh sách bộ từ vựng.' });
  }
};

const getPublicLists = async (req, res) => {
  try {
    const { topic, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('core_ielts_lms_vocabulary_lists')
      .select(`
        id, title, description, topic, user_id,
        core_ielts_lms_users!user_id (full_name),
        item_count:core_ielts_lms_vocabulary_items(count)
      `, { count: 'exact' })
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (topic) query = query.eq('topic', topic);

    const { data, count, error } = await query;
    if (error) throw error;
    res.json({ lists: data, pagination: { total: count, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    console.error('Get public lists error:', err);
    res.status(500).json({ error: 'Không thể tải danh sách bộ từ vựng công khai.' });
  }
};

const createList = async (req, res) => {
  try {
    const { title, description, topic, is_public } = req.body;
    if (!title) return res.status(400).json({ error: 'Vui lòng nhập tiêu đề cho bộ từ vựng.' });

    const { data, error } = await supabase
      .from('core_ielts_lms_vocabulary_lists')
      .insert({ user_id: req.user.id, title, description, topic, is_public: !!is_public })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ list: data });
  } catch (err) {
    console.error('Create vocab list error:', err);
    res.status(500).json({ error: 'Tạo bộ từ vựng thất bại. Vui lòng thử lại.' });
  }
};

const updateList = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, topic, is_public } = req.body;

    const { data, error } = await supabase
      .from('core_ielts_lms_vocabulary_lists')
      .update({ title, description, topic, is_public })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Không tìm thấy bộ từ vựng hoặc bạn không có quyền chỉnh sửa bộ này.' });

    res.json({ list: data });
  } catch (err) {
    console.error('Update vocab list error:', err);
    res.status(500).json({ error: 'Cập nhật bộ từ vựng thất bại. Vui lòng thử lại.' });
  }
};

const deleteList = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('core_ielts_lms_vocabulary_lists')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ message: 'Đã xóa bộ từ vựng thành công.' });
  } catch (err) {
    console.error('Delete vocab list error:', err);
    res.status(500).json({ error: 'Xóa bộ từ vựng thất bại. Vui lòng thử lại.' });
  }
};

// ---- VOCABULARY ITEMS ----

const getItems = async (req, res) => {
  try {
    const { listId } = req.params;

    // Verify list access
    const { data: list } = await supabase
      .from('core_ielts_lms_vocabulary_lists')
      .select('user_id, is_public')
      .eq('id', listId)
      .single();

    if (!list || (list.user_id !== req.user.id && !list.is_public)) {
      return res.status(403).json({ error: 'Bạn không có quyền truy cập bộ từ vựng này.' });
    }

    const { data, error } = await supabase
      .from('core_ielts_lms_vocabulary_items')
      .select('*')
      .eq('list_id', listId)
      .order('order_index', { ascending: true });

    if (error) throw error;

    // Get spaced repetition progress for own lists
    if (list.user_id === req.user.id) {
      const itemIds = data.map(i => i.id);
      if (itemIds.length) {
        const { data: progress } = await supabase
          .from('core_ielts_lms_vocab_user_progress')
          .select('*')
          .eq('user_id', req.user.id)
          .in('item_id', itemIds);

        data.forEach(item => {
          item.progress = progress?.find(p => p.item_id === item.id) || null;
        });
      }
    }

    res.json({ items: data });
  } catch (err) {
    console.error('Get vocab items error:', err);
    res.status(500).json({ error: 'Không thể tải danh sách từ trong bộ từ vựng.' });
  }
};

const addItem = async (req, res) => {
  try {
    const { listId } = req.params;
    const { word, definition, example, phonetic, part_of_speech, image_url, audio_url } = req.body;

    if (!word || !definition) {
      return res.status(400).json({ error: 'Vui lòng nhập từ vựng và định nghĩa.' });
    }

    // Verify ownership
    const { data: list } = await supabase
      .from('core_ielts_lms_vocabulary_lists')
      .select('user_id')
      .eq('id', listId)
      .single();

    if (!list || list.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Bạn không có quyền thêm từ vào bộ từ vựng này.' });
    }

    // Get max order_index
    const { data: maxItem } = await supabase
      .from('core_ielts_lms_vocabulary_items')
      .select('order_index')
      .eq('list_id', listId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    const order_index = (maxItem?.order_index || 0) + 1;

    const { data, error } = await supabase
      .from('core_ielts_lms_vocabulary_items')
      .insert({ list_id: listId, word, definition, example, phonetic, part_of_speech, image_url, audio_url, order_index })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ item: data });
  } catch (err) {
    console.error('Add vocab item error:', err);
    res.status(500).json({ error: 'Thêm từ vựng thất bại. Vui lòng thử lại.' });
  }
};

const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { word, definition, example, phonetic, part_of_speech, image_url, audio_url } = req.body;

    // Verify ownership via join
    const { data: item } = await supabase
      .from('core_ielts_lms_vocabulary_items')
      .select('id, core_ielts_lms_vocabulary_lists!list_id (user_id)')
      .eq('id', id)
      .single();

    if (!item || item.core_ielts_lms_vocabulary_lists?.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Bạn không có quyền chỉnh sửa từ vựng này.' });
    }

    const { data, error } = await supabase
      .from('core_ielts_lms_vocabulary_items')
      .update({ word, definition, example, phonetic, part_of_speech, image_url, audio_url })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ item: data });
  } catch (err) {
    console.error('Update vocab item error:', err);
    res.status(500).json({ error: 'Cập nhật từ vựng thất bại. Vui lòng thử lại.' });
  }
};

const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: item } = await supabase
      .from('core_ielts_lms_vocabulary_items')
      .select('id, core_ielts_lms_vocabulary_lists!list_id (user_id)')
      .eq('id', id)
      .single();

    if (!item || item.core_ielts_lms_vocabulary_lists?.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Bạn không có quyền xóa từ vựng này.' });
    }

    const { error } = await supabase.from('core_ielts_lms_vocabulary_items').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Đã xóa từ vựng.' });
  } catch (err) {
    console.error('Delete vocab item error:', err);
    res.status(500).json({ error: 'Xóa từ vựng thất bại. Vui lòng thử lại.' });
  }
};

// ---- SPACED REPETITION ----

const getDueItems = async (req, res) => {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('core_ielts_lms_vocab_user_progress')
      .select(`
        *,
        core_ielts_lms_vocabulary_items!item_id (
          id, word, definition, example, phonetic, part_of_speech, image_url, audio_url,
          core_ielts_lms_vocabulary_lists!list_id (title)
        )
      `)
      .eq('user_id', req.user.id)
      .lte('next_review_at', now)
      .neq('status', 'mastered')
      .order('next_review_at', { ascending: true })
      .limit(20);

    if (error) throw error;
    res.json({ due_items: data });
  } catch (err) {
    console.error('Get due items error:', err);
    res.status(500).json({ error: 'Không thể tải danh sách từ cần ôn tập.' });
  }
};

const reviewItem = async (req, res) => {
  try {
    const { item_id, quality } = req.body; // quality: 0-5 (SM-2 algorithm)

    if (!item_id || quality === undefined) {
      return res.status(400).json({ error: 'Vui lòng cung cấp item_id và điểm chất lượng (0-5).' });
    }

    const q = Math.max(0, Math.min(5, parseInt(quality)));

    // Get current progress
    const { data: current } = await supabase
      .from('core_ielts_lms_vocab_user_progress')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('item_id', item_id)
      .single();

    // SM-2 Algorithm
    let ease_factor = current?.ease_factor || 2.5;
    let interval_days = current?.interval_days || 1;
    let repetitions = current?.repetitions || 0;

    if (q >= 3) {
      if (repetitions === 0) interval_days = 1;
      else if (repetitions === 1) interval_days = 6;
      else interval_days = Math.round(interval_days * ease_factor);
      repetitions++;
    } else {
      repetitions = 0;
      interval_days = 1;
    }

    ease_factor = Math.max(1.3, ease_factor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));

    const next_review_at = new Date(Date.now() + interval_days * 24 * 60 * 60 * 1000).toISOString();
    let status = 'learning';
    if (repetitions >= 5 && ease_factor > 2.0) status = 'mastered';
    else if (repetitions >= 1) status = 'review';

    const { data, error } = await supabase
      .from('core_ielts_lms_vocab_user_progress')
      .upsert(
        {
          user_id: req.user.id,
          item_id,
          ease_factor,
          interval_days,
          repetitions,
          status,
          next_review_at,
          last_reviewed_at: new Date().toISOString()
        },
        { onConflict: 'user_id,item_id' }
      )
      .select()
      .single();

    if (error) throw error;
    res.json({ progress: data });
  } catch (err) {
    console.error('Review item error:', err);
    res.status(500).json({ error: 'Cập nhật tiến độ ôn tập thất bại. Vui lòng thử lại.' });
  }
};

module.exports = {
  getMyLists, getPublicLists, createList, updateList, deleteList,
  getItems, addItem, updateItem, deleteItem,
  getDueItems, reviewItem
};
