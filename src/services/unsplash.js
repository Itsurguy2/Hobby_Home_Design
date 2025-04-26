import { createApi } from 'unsplash-js';

const unsplash = createApi({
  accessKey: import.meta.env.VITE_UNSPLASH_ACCESS_KEY,
});

export const searchHomeDesigns = async (query, page = 1) => {
  try {
    const result = await unsplash.search.getPhotos({
      query: `home design ${query}`,
      page,
      perPage: 20,
      orientation: 'landscape',
    });

    if (result.errors) {
      throw new Error(result.errors[0]);
    }

    return result.response;
  } catch (error) {
    console.error('Error fetching from Unsplash:', error);
    throw error;
  }
};

export const getRandomHomeDesigns = async (count = 20) => {
  try {
    const result = await unsplash.photos.getRandom({
      count,
      query: 'home interior design',
      orientation: 'landscape'
    });

    if (result.errors) {
      throw new Error(result.errors[0]);
    }

    // Ensure we always return an array
    const photos = Array.isArray(result.response) 
      ? result.response 
      : [result.response];

    return photos;
  } catch (error) {
    console.error('Error fetching random designs:', error);
    throw error;
  }
};


