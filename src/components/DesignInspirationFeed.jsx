import { useState, useEffect } from 'react';
import { searchHomeDesigns, getRandomHomeDesigns } from '../services/unsplash';
import { designPostsService } from '../services/supabase';
import { useUserPreferences } from '../context/UserPreferencesContext';

function DesignInspirationFeed() {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roomTypeFilter, setRoomTypeFilter] = useState('');
  const { preferences } = useUserPreferences();

  useEffect(() => {
    loadInitialDesigns();
  }, []);

  const loadInitialDesigns = async () => {
    try {
      setLoading(true);
      const [unsplashDesigns, savedDesigns] = await Promise.all([
        getRandomHomeDesigns(20),
        designPostsService.getPosts({ page: 1, limit: 20 })
      ]);

      // Combine and format the designs
      const formattedDesigns = [
        ...unsplashDesigns.map(design => ({
          id: design.id,
          title: design.description || 'Untitled Design',
          imageUrl: design.urls.regular,
          thumbnail: design.urls.small,
          photographer: design.user.name,
          source: 'unsplash',
          likes: design.likes
        })),
        ...savedDesigns.map(design => ({
          id: design.id,
          title: design.title,
          imageUrl: design.full_url,
          thumbnail: design.thumbnail_url,
          roomType: design.room_type,
          styleTags: design.style_tags,
          source: 'community',
          upvotes: design.upvotes
        }))
      ];

      setDesigns(formattedDesigns);
    } catch (error) {
      console.error('Error loading designs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    try {
      setLoading(true);
      const results = await searchHomeDesigns(query);
      setDesigns(results.results.map(design => ({
        id: design.id,
        title: design.description || 'Untitled Design',
        imageUrl: design.urls.regular,
        thumbnail: design.urls.small,
        photographer: design.user.name,
        source: 'unsplash',
        likes: design.likes
      })));
    } catch (error) {
      console.error('Error searching designs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="design-inspiration-feed">
      <div className="search-filters">
        <input
          type="search"
          placeholder="Search design inspiration..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
        />
        <select
          value={roomTypeFilter}
          onChange={(e) => setRoomTypeFilter(e.target.value)}
        >
          <option value="">All Rooms</option>
          <option value="living-room">Living Room</option>
          <option value="bedroom">Bedroom</option>
          <option value="kitchen">Kitchen</option>
          <option value="bathroom">Bathroom</option>
          <option value="office">Home Office</option>
        </select>
      </div>

      <div className="designs-grid">
        {loading ? (
          <div className="loading">Loading designs...</div>
        ) : (
          designs.map(design => (
            <div key={design.id} className="design-card">
              <img 
                src={preferences.showImagePreview ? design.thumbnail : design.imageUrl} 
                alt={design.title}
                loading="lazy"
              />
              <div className="design-info">
                <h3>{design.title}</h3>
                {design.source === 'unsplash' && (
                  <p>Photo by {design.photographer}</p>
                )}
                {design.source === 'community' && (
                  <div className="tags">
                    {design.styleTags?.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DesignInspirationFeed;