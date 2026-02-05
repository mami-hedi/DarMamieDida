import { useState } from "react";

interface Review {
  name: string;
  rating: number;
  comment: string;
}

interface Props {
  reviews: Review[];
}

export const ReviewsCarousel = ({ reviews }: Props) => {
  const [startIndex, setStartIndex] = useState(0);

  const itemsToShow = 4;
  const total = reviews.length;

  const next = () => {
    setStartIndex((prev) => (prev + itemsToShow) % total);
  };

  const prev = () => {
    setStartIndex((prev) =>
      (prev - itemsToShow + total) % total
    );
  };

  const visibleReviews = [];
  for (let i = 0; i < itemsToShow; i++) {
    visibleReviews.push(reviews[(startIndex + i) % total]);
  }

  return (
    <div className="relative">
      {/* Flèches */}
      <button
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100 z-10"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100 z-10"
      >
        ›
      </button>

      {/* Avis visibles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 overflow-hidden">
        {visibleReviews.map((review, index) => (
          <div
            key={index}
            className="bg-secondary p-6 rounded-lg text-center shadow animate-fade-in"
          >
            <div className="mb-4 text-yellow-500">
              {Array.from({ length: review.rating }).map((_, i) => (
                <span key={i}>★</span>
              ))}
            </div>
            <p className="font-body text-sm text-muted-foreground mb-3">
              "{review.comment}"
            </p>
            <p className="font-semibold text-foreground">- {review.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
