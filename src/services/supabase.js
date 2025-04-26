import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const designPostsService = {
  async createPost({ title, description, unsplashImage, styleTags, roomType, colorPalette }) {
    const { data, error } = await supabase
      .from('design_posts')
      .insert([{
        title,
        description,
        user_id: supabase.auth.user().id,
        unsplash_image_id: unsplashImage.id,
        unsplash_url: unsplashImage.urls.raw,
        thumbnail_url: unsplashImage.urls.small,
        full_url: unsplashImage.urls.full,
        style_tags: styleTags,
        room_type: roomType,
        color_palette: colorPalette,
      }])
      .single();

    if (error) throw error;
    return data;
  },

  async getPosts({ page = 1, limit = 10, roomType = null, styleTag = null }) {
    let query = supabase
      .from('design_posts')
      .select(`
        *,
        design_comments (
          id,
          content,
          user_id,
          created_at
        )
      `)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (roomType) {
      query = query.eq('room_type', roomType);
    }

    if (styleTag) {
      query = query.contains('style_tags', [styleTag]);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async saveDesign(postId) {
    const { data, error } = await supabase
      .from('saved_designs')
      .insert([{
        user_id: supabase.auth.user().id,
        post_id: postId,
      }])
      .single();

    if (error) throw error;
    return data;
  },

  async getSavedDesigns() {
    const { data, error } = await supabase
      .from('saved_designs')
      .select(`
        *,
        design_posts (*)
      `)
      .eq('user_id', supabase.auth.user().id);

    if (error) throw error;
    return data;
  },
};
