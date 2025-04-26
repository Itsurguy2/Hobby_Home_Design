import { useState } from 'react'
import PostPreview from './PostPreview'

function HomeFeed({ posts }) {
  const [sortBy, setSortBy] = useState('time') // 'time' or 'upvotes'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFlag, setSelectedFlag] = useState('') // '' means show all
  const [loading, setLoading] = useState(false)

  // Filter posts by search query and flag
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFlag = !selectedFlag || post.flag === selectedFlag
    return matchesSearch && matchesFlag
  })

  // Sort posts based on selected criteria
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'time') {
      return b.id - a.id // Sort by creation time (newest first)
    } else {
      return b.upvotes - a.upvotes // Sort by upvotes (highest first)
    }
  })

  return (
    <div className="home-feed">
      <div className="feed-controls">
        <div className="search-bar">
          <input
            type="search"
            placeholder="Search posts by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <label>Filter by:</label>
          <select 
            value={selectedFlag} 
            onChange={(e) => setSelectedFlag(e.target.value)}
          >
            <option value="">All Posts</option>
            <option value="question">Questions</option>
            <option value="opinion">Opinions</option>
            <option value="news">News</option>
            <option value="discussion">Discussions</option>
          </select>
        </div>

        <div className="sort-controls">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="time">Latest</option>
            <option value="upvotes">Most Upvoted</option>
          </select>
        </div>
      </div>

      <div className="posts-grid">
        {loading ? (
          // Show loading placeholders
          Array(6).fill().map((_, index) => (
            <PostPreview key={`loading-${index}`} loading={true} />
          ))
        ) : sortedPosts.length > 0 ? (
          sortedPosts.map(post => (
            <PostPreview key={post.id} post={post} loading={false} />
          ))
        ) : (
          <p className="no-results">No posts found</p>
        )}
      </div>
    </div>
  )
}

export default HomeFeed



