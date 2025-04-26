import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import CreatePostForm from './components/CreatePostForm'
import HomeFeed from './components/HomeFeed'
import PostDetail from './components/PostDetail'
import { UserPreferencesProvider } from './context/UserPreferencesContext'
import UserPreferences from './components/UserPreferences'
import DesignInspirationFeed from './components/DesignInspirationFeed'

function App() {
  const [posts, setPosts] = useState([])
  const [userId, setUserId] = useState(null)

  // Generate and store user ID on first load
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId')
    if (storedUserId) {
      setUserId(storedUserId)
    } else {
      const newUserId = `user_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('userId', newUserId)
      setUserId(newUserId)
    }
  }, [])

  const handleCreatePost = (newPost) => {
    setPosts([...posts, { 
      ...newPost, 
      id: Date.now(),
      authorId: userId,
      upvotes: 0,
      comments: [],
      timestamp: new Date().toISOString()
    }])
  }

  const handleEditPost = (postId, updatedPost) => {
    setPosts(posts.map(post => {
      if (post.id === postId && post.authorId === userId) {
        return { ...post, ...updatedPost }
      }
      return post
    }))
  }

  const handleDeletePost = (postId) => {
    const post = posts.find(p => p.id === postId)
    if (post && post.authorId === userId) {
      setPosts(posts.filter(p => p.id !== postId))
      return true
    }
    return false
  }

  const handleUpvote = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, upvotes: post.upvotes + 1 }
        : post
    ))
  }

  const handleAddComment = (postId, commentText) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            comments: [...post.comments, {
              id: Date.now(),
              text: commentText,
              authorId: userId,
              timestamp: new Date().toISOString()
            }]
          }
        : post
    ))
  }

  const handleDeleteComment = (postId, commentId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const comment = post.comments.find(c => c.id === commentId)
        if (comment && comment.authorId === userId) {
          return {
            ...post,
            comments: post.comments.filter(c => c.id !== commentId)
          }
        }
      }
      return post
    }))
  }

  return (
    <UserPreferencesProvider>
      <BrowserRouter>
        <div className="app">
          <nav className="main-nav">
            <Link to="/">Home</Link>
            <Link to="/create">Create Post</Link>
            <Link to="/preferences">Preferences</Link>
            <Link to="/inspiration">Design Inspiration</Link>
            <span className="user-id">User ID: {userId}</span>
          </nav>

          <Routes>
            <Route 
              path="/" 
              element={<HomeFeed posts={posts} currentUserId={userId} />} 
            />
            <Route 
              path="/create" 
              element={<CreatePostForm onSubmit={handleCreatePost} posts={posts} />} 
            />
            <Route 
              path="/post/:id" 
              element={
                <PostDetail 
                  posts={posts}
                  currentUserId={userId}
                  onUpvote={handleUpvote}
                  onAddComment={handleAddComment}
                  onDeleteComment={handleDeleteComment}
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
                />
              } 
            />
            <Route path="/preferences" element={<UserPreferences />} />
            <Route path="/inspiration" element={<DesignInspirationFeed />} />
          </Routes>
        </div>
      </BrowserRouter>
    </UserPreferencesProvider>
  )
}

export default App

