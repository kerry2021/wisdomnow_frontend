"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface CardProps {
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkTo: string;
}

const ContentCard = ({ title, subtitle, imageUrl, linkTo }: CardProps) => {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(linkTo)}
      className="group cursor-pointer border rounded-lg overflow-hidden shadow hover:shadow-lg transition"
    >
      <div className="relative w-full h-48">
        <Image
          src={imageUrl || '/placeholder.png'}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-amber-600 group-hover:underline">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1 group-hover:underline">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default ContentCard;

