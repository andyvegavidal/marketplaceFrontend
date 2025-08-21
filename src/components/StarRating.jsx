import React from 'react';

function StarRating({ rating, maxRating = 5, size = 'small', interactive = false, onRatingChange = null }) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  const handleStarClick = (starValue) => {
    if (interactive && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const renderStar = (index) => {
    const starValue = index + 1;
    const isFilled = starValue <= rating;
    const isHalfFilled = rating > index && rating < starValue;

    return (
      <button
        key={index}
        type="button"
        className={`${sizeClasses[size]} ${
          interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
        }`}
        onClick={() => handleStarClick(starValue)}
        disabled={!interactive}
      >
        <svg
          className={`w-full h-full ${
            isFilled || isHalfFilled ? 'text-yellow-400' : 'text-gray-300'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          {isHalfFilled ? (
            <defs>
              <linearGradient id={`halfFill-${index}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#D1D5DB" />
              </linearGradient>
            </defs>
          ) : null}
          <path
            fillRule="evenodd"
            d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z"
            clipRule="evenodd"
            fill={isHalfFilled ? `url(#halfFill-${index})` : 'currentColor'}
          />
        </svg>
      </button>
    );
  };

  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: maxRating }, (_, index) => renderStar(index))}
      {rating > 0 && (
        <span className="ml-2 text-sm text-gray-600">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
}

export default StarRating;
