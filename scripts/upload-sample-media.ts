require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const path = require('path');

// Configura o Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const sampleMedia = [
  {
    name: 'veleiro-sunset-main.jpg',
    path: 'https://images.unsplash.com/photo-1566847438217-76e82d383f84'
  },
  {
    name: 'veleiro-sunset-1.jpg',
    path: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5'
  },
  {
    name: 'veleiro-sunset-2.jpg',
    path: 'https://images.unsplash.com/photo-1540946485063-a40da27545f8'
  },
  {
    name: 'lancha-sport-main.jpg',
    path: 'https://images.unsplash.com/photo-1621277224630-81a7494b3d46'
  },
  {
    name: 'lancha-sport-1.jpg',
    path: 'https://images.unsplash.com/photo-1588401667987-e06480c453b6'
  },
  {
    name: 'lancha-sport-2.jpg',
    path: 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534'
  },
  {
    name: 'catamara-paradise-main.jpg',
    path: 'https://images.unsplash.com/photo-1588873281272-14886ba1f737'
  },
  {
    name: 'catamara-paradise-1.jpg',
    path: 'https://images.unsplash.com/photo-1588873281272-14886ba1f737'
  },
  {
    name: 'catamara-paradise-2.jpg',
    path: 'https://images.unsplash.com/photo-1588873281272-14886ba1f737'
  }
];

async function uploadSampleMedia() {
  console.log('Iniciando upload com as seguintes configurações:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: '***'
  });

  for (const media of sampleMedia) {
    try {
      console.log(`Uploading ${media.name}...`);
      const result = await cloudinary.uploader.upload(media.path, {
        public_id: path.parse(media.name).name,
        folder: 'boats',
        overwrite: true
      });
      console.log(`Uploaded ${media.name}: ${result.secure_url}`);
    } catch (error) {
      console.error(`Error uploading ${media.name}:`, error);
    }
  }

  // Upload de vídeos de exemplo do Cloudinary
  const sampleVideos = [
    {
      name: 'veleiro-sunset-tour.mp4',
      path: 'https://res.cloudinary.com/demo/video/upload/v1689798929/samples/sea-turtle.mp4'
    },
    {
      name: 'lancha-sport-wakeboard.mp4',
      path: 'https://res.cloudinary.com/demo/video/upload/v1689798929/samples/sea-turtle.mp4'
    },
    {
      name: 'catamara-paradise-tour.mp4',
      path: 'https://res.cloudinary.com/demo/video/upload/v1689798929/samples/sea-turtle.mp4'
    }
  ];

  for (const video of sampleVideos) {
    try {
      console.log(`Uploading ${video.name}...`);
      const result = await cloudinary.uploader.upload(video.path, {
        public_id: path.parse(video.name).name,
        folder: 'boats',
        resource_type: 'video',
        overwrite: true
      });
      console.log(`Uploaded ${video.name}: ${result.secure_url}`);
    } catch (error) {
      console.error(`Error uploading ${video.name}:`, error);
    }
  }
}

uploadSampleMedia()
  .then(() => console.log('Upload completo!'))
  .catch(console.error);
