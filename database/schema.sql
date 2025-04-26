-- Create tables for our home design application
create table public.design_posts (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text,
    user_id text not null,
    unsplash_image_id text,
    unsplash_url text,
    thumbnail_url text,
    full_url text,
    style_tags text[],
    room_type text,
    color_palette text[],
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    upvotes integer default 0,
    views integer default 0
);

-- Enable Row Level Security
alter table public.design_posts enable row level security;

-- Create policy for reading posts (public)
create policy "Anyone can view posts"
    on design_posts for select
    using (true);

-- Create policy for creating posts (authenticated users only)
create policy "Authenticated users can create posts"
    on design_posts for insert
    to authenticated
    with check (true);

-- Create policy for updating posts (post owner only)
create policy "Users can update own posts"
    on design_posts for update
    using (auth.uid()::text = user_id);

-- Create comments table
create table public.design_comments (
    id uuid default gen_random_uuid() primary key,
    post_id uuid references public.design_posts(id) on delete cascade,
    user_id text not null,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for comments
alter table public.design_comments enable row level security;

-- Comments policies
create policy "Anyone can view comments"
    on design_comments for select
    using (true);

create policy "Authenticated users can create comments"
    on design_comments for insert
    to authenticated
    with check (true);

-- Create saved_designs table for bookmarks
create table public.saved_designs (
    id uuid default gen_random_uuid() primary key,
    user_id text not null,
    post_id uuid references public.design_posts(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, post_id)
);

-- Enable RLS for saved designs
alter table public.saved_designs enable row level security;

-- Saved designs policies
create policy "Users can view their saved designs"
    on saved_designs for select
    using (auth.uid()::text = user_id);

create policy "Users can save designs"
    on saved_designs for insert
    to authenticated
    with check (auth.uid()::text = user_id);

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger for updating updated_at
create trigger update_design_posts_updated_at
    before update on design_posts
    for each row
    execute function update_updated_at_column();

-- Add view count tracking
create or replace function increment_views()
returns trigger as $$
begin
    update design_posts
    set views = views + 1
    where id = new.id;
    return new;
end;
$$ language plpgsql;

create trigger increment_post_views
    after select on design_posts
    for each row
    execute function increment_views();

-- Add upvotes table to track user votes
create table public.design_upvotes (
    id uuid default gen_random_uuid() primary key,
    post_id uuid references public.design_posts(id) on delete cascade,
    user_id text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(post_id, user_id)
);

-- Enable RLS for upvotes
alter table public.design_upvotes enable row level security;

-- Upvotes policies
create policy "Users can view upvotes"
    on design_upvotes for select
    using (true);

create policy "Users can upvote posts"
    on design_upvotes for insert
    to authenticated
    with check (auth.uid()::text = user_id);

-- Function to update post upvotes count
create or replace function update_post_upvotes()
returns trigger as $$
begin
    if (TG_OP = 'INSERT') then
        update design_posts
        set upvotes = upvotes + 1
        where id = new.post_id;
    elsif (TG_OP = 'DELETE') then
        update design_posts
        set upvotes = upvotes - 1
        where id = old.post_id;
    end if;
    return null;
end;
$$ language plpgsql;

-- Triggers for upvote counting
create trigger update_post_upvotes_on_vote
    after insert or delete on design_upvotes
    for each row
    execute function update_post_upvotes();

-- Add user profiles table
create table public.user_profiles (
    id uuid default gen_random_uuid() primary key,
    user_id text not null unique,
    display_name text,
    bio text,
    preferred_styles text[],
    favorite_colors text[],
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for user profiles
alter table public.user_profiles enable row level security;

-- User profiles policies
create policy "Users can view any profile"
    on user_profiles for select
    using (true);

create policy "Users can update own profile"
    on user_profiles for update
    using (auth.uid()::text = user_id);

create policy "Users can insert own profile"
    on user_profiles for insert
    to authenticated
    with check (auth.uid()::text = user_id);
