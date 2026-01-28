import { Star, User } from "lucide-react";
import Image from "next/image";

// Definimos la estructura de lo que recibimos
interface ReviewProps {
  reviews: {
    id: string;
    rating: number;
    comment: string;
    createdAt: Date;
    user: {
      name: string | null;
      image: string | null;
    };
  }[];
}

export default function ReviewsList({ reviews }: ReviewProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
        <p>Aún no hay reseñas. ¡Sé el primero en opinar!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b border-slate-100 dark:border-slate-800 pb-6 last:border-0">
          <div className="flex items-start justify-between mb-2">
            
            {/* Usuario */}
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-200">
                {review.user.image ? (
                  <Image src={review.user.image} alt="User" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {review.user.name || "Usuario Anónimo"}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Estrellas Estáticas */}
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-slate-200 dark:text-slate-700"
                  }`}
                />
              ))}
            </div>
          </div>

          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            {review.comment}
          </p>
        </div>
      ))}
    </div>
  );
}
