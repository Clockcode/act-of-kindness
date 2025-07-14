import React from 'react';

// Mock Next.js Link component for testing
const NextLink = ({ 
  children, 
  href,
  prefetch,
  ...props 
}: any) => (
  <a 
    href={href} 
    data-prefetch={prefetch}
    {...props}
  >
    {children}
  </a>
);

export default NextLink;