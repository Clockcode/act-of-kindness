import React from 'react';

// Mock Next.js Image component for testing
const NextImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  priority,
  ...props 
}: any) => (
  <img 
    src={src} 
    alt={alt || ''} 
    width={width}
    height={height}
    data-priority={priority}
    {...props} 
  />
);

export default NextImage;