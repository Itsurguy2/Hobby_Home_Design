import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { UserPreferencesContext } from '../context/UserPreferencesContext'

function PostPreview({ post }) {
  const navigate = useNavigate()
  const contextValue = useContext(UserPreferencesContext) || {}
  const preferences = contextValue.preferences || {
    showContentPreview: true,
    showImagePreview: true
  }

  const handlePostClick = () => {
    navigate(`/post/${post.id}`)
  }

  const renderVideoPreview = () => {
    if (!post.videoUrl) return null

    if (post.videoUrl.includes('youtube.com') || post.videoUrl.includes('youtu.be')) {
      const match = post.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
      const videoId = match ? match[1] : null
      if (!videoId) return null

      return (
        <iframe
          className="video-preview"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={post.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )
    }

    if (post.videoUrl.includes('vimeo.com')) {
      const match = post.videoUrl.match(/vimeo\.com\/(\d+)/)
      const videoId = match ? match[1] : null
      if (!videoId) return null

      return (
        <iframe
          className="video-preview"
          src={`https://player.vimeo.com/video/${videoId}`}
          title={post.title}
          frameBorder="0"
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      )
    }

    return (
      <video
        className="video-preview"
        controls
        src={post.videoUrl}
        title={post.title}
      />
    )
  }

  if (!post) return null

  return (
    <div 
      className="post-preview"
      onClick={handlePostClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter') handlePostClick()
      }}
    >
      {post.flag && (
        <span className={`post-flag ${post.flag}`}>
          {post.flag.charAt(0).toUpperCase() + post.flag.slice(1)}
        </span>
      )}

      <h3 className="post-title">{post.title}</h3>
      
      <div className="post-meta">
        <span className="post-author">Posted by: {post.authorId}</span>
        <span className="post-upvotes">👍 {post.upvotes || 0}</span>
      </div>

      {preferences.showContentPreview && post.content && (
        <p className="post-content-preview">
          {post.content.slice(0, 150)}
          {post.content.length > 150 ? '...' : ''}
        </p>
      )}

      {preferences.showImagePreview && post.imageUrl && (
        <div className="image-container">
          <img 
            src={post.imageUrl} 
            alt={post.title}
            className="post-image-preview" 
          />
          <a 
            href={post.imageUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="image-source-link"
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            View Source
          </a>
        </div>
      )}

      {post.videoUrl && renderVideoPreview()}
    </div>
  )
}

export default PostPreview






