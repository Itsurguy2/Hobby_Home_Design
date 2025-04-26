import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

function PostDetail({ 
  posts, 
  currentUserId, 
  onUpvote, 
  onAddComment, 
  onDeleteComment,
  onEdit, 
  onDelete 
}) {
  const { id } = useParams()
  const navigate = useNavigate()
  const post = posts.find(p => p.id === Number(id))
  const [newComment, setNewComment] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editedPost, setEditedPost] = useState(null)

  if (!post) {
    return <div>Post not found</div>
  }

  const isAuthor = post.authorId === currentUserId

  const handleSubmitComment = (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    
    onAddComment(post.id, newComment)
    setNewComment('')
  }

  const handleEditClick = () => {
    if (!isAuthor) {
      alert('You can only edit your own posts')
      return
    }
    setIsEditing(true)
    setEditedPost({
      title: post.title,
      content: post.content,
      imageUrl: post.imageUrl
    })
  }

  const handleSaveEdit = () => {
    if (!isAuthor) return
    onEdit(post.id, editedPost)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedPost(null)
  }

  const handleDelete = () => {
    if (!isAuthor) {
      alert('You can only delete your own posts')
      return
    }
    
    if (window.confirm('Are you sure you want to delete this post?')) {
      const success = onDelete(post.id)
      if (success) {
        navigate('/')
      }
    }
  }

  const handleDeleteComment = (commentId) => {
    const comment = post.comments.find(c => c.id === commentId)
    if (comment.authorId !== currentUserId) {
      alert('You can only delete your own comments')
      return
    }
    onDeleteComment(post.id, commentId)
  }

  const renderReferencedPost = () => {
    if (!post.referencedPostId) return null;
    
    const referencedPost = posts.find(p => p.id === post.referencedPostId);
    if (!referencedPost) return null;

    return (
      <div className="referenced-post">
        <h3>Referenced Post:</h3>
        <Link to={`/post/${referencedPost.id}`} className="referenced-post-link">
          <div className="referenced-post-content">
            <h4>{referencedPost.title}</h4>
            {referencedPost.content && (
              <p className="referenced-post-excerpt">
                {referencedPost.content.slice(0, 150)}
                {referencedPost.content.length > 150 ? '...' : ''}
              </p>
            )}
            <span className="referenced-post-meta">
              Posted by: {referencedPost.authorId}
            </span>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <div className="post-detail">
      <div className="post-meta">
        <span className="post-author">Posted by: {post.authorId}</span>
        {isAuthor && (
          <div className="post-actions">
            <button 
              className="edit-button"
              onClick={handleEditClick}
            >
              Edit Post
            </button>
            <button 
              className="delete-button"
              onClick={handleDelete}
            >
              Delete Post
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="edit-form">
          <input
            type="text"
            value={editedPost.title}
            onChange={(e) => setEditedPost({...editedPost, title: e.target.value})}
            className="edit-title"
          />
          <textarea
            value={editedPost.content}
            onChange={(e) => setEditedPost({...editedPost, content: e.target.value})}
            className="edit-content"
          />
          <input
            type="url"
            value={editedPost.imageUrl}
            onChange={(e) => setEditedPost({...editedPost, imageUrl: e.target.value})}
            className="edit-image-url"
            placeholder="Image URL"
          />
          <div className="edit-actions">
            <button onClick={handleSaveEdit}>Save Changes</button>
            <button onClick={handleCancelEdit}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <h1>{post.title}</h1>
          
          {renderReferencedPost()}
          
          {post.content && (
            <p className="post-content">{post.content}</p>
          )}
          
          {post.imageUrl && (
            <div className="image-container">
              <img 
                src={post.imageUrl} 
                alt={post.title} 
                className="post-image"
              />
              <a 
                href={post.imageUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="image-source-link"
              >
                View Original Image
              </a>
            </div>
          )}
          
          <div className="post-interactions">
            <button 
              className="upvote-button"
              onClick={() => onUpvote(post.id)}
            >
              👍 {post.upvotes}
            </button>
          </div>
        </>
      )}

      <div className="comments-section">
        <h2>Comments</h2>
        
        <form onSubmit={handleSubmitComment} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows="3"
          />
          <button type="submit">Post Comment</button>
        </form>

        <div className="comments-list">
          {post.comments.length > 0 ? (
            post.comments.map(comment => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <span className="comment-author">By: {comment.authorId}</span>
                  <span className="comment-date">
                    {new Date(comment.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="comment-text">{comment.text}</p>
                {comment.authorId === currentUserId && (
                  <button 
                    className="delete-comment"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="no-comments">No comments yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default PostDetail



