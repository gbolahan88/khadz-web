// components/star-rating.tsx
export function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={
            i <= Math.round(rating) ? "text-yellow-500" : "text-neutral-300"
          }
        >
          ★
        </span>
      ))}
    </div>
  );
}