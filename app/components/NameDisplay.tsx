import React from 'react';
import { getRatingClass } from '~/lib/rating';

interface UsernameDisplayProps {
  name: string;
  rating: number;
  className?: string;
}

export default function NameDisplay({ 
  name, 
  rating, 
  className = ''
}: UsernameDisplayProps) {
  const ratingClass = getRatingClass(rating);
  
  if (rating >= 3000) {
    // name với chữ cái đầu màu đỏ nhạt, phần còn lại màu đỏ như grandmaster (#e00)
    const firstChar = name.charAt(0);
    const restChars = name.slice(1);
    
    return (
      <span className={`${className}`}>
        <span style={{ color: '#ff6b6b' }}>{firstChar}</span>
        <span style={{ color: '#e00' }}>{restChars}</span>
      </span>
    );
  }
  
  return (
    <span className={`${ratingClass} ${className}`}>
      {name}
    </span>
  );
}
