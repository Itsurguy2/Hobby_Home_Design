import { useState, useRef } from 'react'

function CreatePostForm({ onSubmit, posts }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [flag, setFlag] = useState('') // '', 'question', 'opinion', 'news', 'discussion'
  const [referencedPostId, setReferencedPostId] = useState('')
  const [showRepostForm, setShowRepostForm] = useState(false)
  const fileInputRef = useRef(null)

  const handleImageFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        fileInputRef.current.value = ''
        return
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        alert('Only JPG, PNG and GIF files are allowed')
        fileInputRef.current.value = ''
        return
      }

      setImageFile(file)
      handleImagePreview(file)
      setImageUrl('') // Clear image URL if file is selected
    }
  }

  const handleImagePreview = (file) => {
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateVideoUrl = (url) => {
    // Support YouTube, Vimeo, and direct video file URLs
    const videoPatterns = {
      youtube: /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
      vimeo: /^(https?:\/\/)?(www\.)?(vimeo\.com\/)(\d+)/,
      direct: /\.(mp4|webm|ogg)$/i
    }

    return Object.values(videoPatterns).some(pattern => pattern.test(url))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    let finalImageUrl = imageUrl;
    
    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);
      
      try {
        console.log('Sending file upload request...');
        
        // Update the fetch URL to use relative path
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          throw new Error('Server response was not JSON');
        }
        
        if (!data.success) {
          throw new Error(data.message || 'Upload failed');
        }

        finalImageUrl = data.url;
      } catch (error) {
        console.error('Error uploading image:', error);
        alert(`Failed to upload image: ${error.message}`);
        return;
      }
    }

    try {
      // Validate video URL if provided
      if (videoUrl && !validateVideoUrl(videoUrl)) {
        alert('Invalid video URL format');
        return;
      }

      // Create the post with the image URL
      onSubmit({
        title,
        content,
        imageUrl: finalImageUrl,
        videoUrl: videoUrl || null,
        flag: flag || null,
        referencedPostId: referencedPostId ? Number(referencedPostId) : null
      });

      // Reset form
      setTitle('');
      setContent('');
      setImageUrl('');
      setImageFile(null);
      setImagePreview(null); // Add this line to clear the preview
      setVideoUrl('');
      setFlag('');
      setReferencedPostId('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    }
  }

  return (
    <div className="create-post-container">
      <div className="post-type-selector">
        <button 
          className={!showRepostForm ? 'active' : ''}
          onClick={() => setShowRepostForm(false)}
        >
          New Post
        </button>
        <button 
          className={showRepostForm ? 'active' : ''}
          onClick={() => setShowRepostForm(true)}
        >
          Repost
        </button>
      </div>

      <form onSubmit={handleSubmit} className="create-post-form">
        {showRepostForm && (
          <div>
            <label htmlFor="referencedPostId">Reference Post ID *</label>
            <input
              id="referencedPostId"
              type="number"
              value={referencedPostId}
              onChange={(e) => setReferencedPostId(e.target.value)}
              required={showRepostForm}
              placeholder="Enter post ID to repost"
            />
            {referencedPostId && (
              <div className="referenced-post-preview">
                {posts.find(p => p.id === Number(referencedPostId)) ? (
                  <p>Referencing post: "{posts.find(p => p.id === Number(referencedPostId)).title}"</p>
                ) : (
                  <p className="error">Post not found</p>
                )}
              </div>
            )}
          </div>
        )}

        <div>
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter post title"
          />
        </div>

        <div>
          <label htmlFor="flag">Post Type</label>
          <select
            id="flag"
            value={flag}
            onChange={(e) => setFlag(e.target.value)}
          >
            <option value="">General</option>
            <option value="question">Question</option>
            <option value="opinion">Opinion</option>
            <option value="news">News</option>
            <option value="discussion">Discussion</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter post content"
          />
        </div>

        <div>
          <label htmlFor="imageFile">Upload Image</label>
          <input
            id="imageFile"
            type="file"
            accept="image/*"
            onChange={handleImageFileChange}
            ref={fileInputRef}
          />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px' }} />
              <button 
                type="button" 
                onClick={() => {
                  setImagePreview(null);
                  setImageFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                Remove Image
              </button>
            </div>
          )}
        </div>
        
        <div>
          <label htmlFor="imageUrl">Or Image URL</label>
          <input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Enter image URL"
            disabled={!!imageFile}
          />
        </div>

        <div>
          <label htmlFor="videoUrl">Video URL</label>
          <input
            id="videoUrl"
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Enter YouTube, Vimeo, or direct video URL"
          />
        </div>

        <button type="submit">
          {showRepostForm ? 'Create Repost' : 'Create Post'}
        </button>
      </form>
    </div>
  )
}

export default CreatePostForm











