import React from 'react';

const StarRating = ({ rating, onRating }) => {
  return (
      <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
              <span
                  key={star}
                  className={`cursor-pointer text-2xl ${rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                  onClick={() => onRating(star)}
              >
                  ★
              </span>
          ))}
      </div>
  );
};

export default StarRating;