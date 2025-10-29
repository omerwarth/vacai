import React from 'react';

interface Props {
  id: string;
  title: string;
  subtitle?: string;
  src: string;
  selected?: boolean;
  // optional CSS object-position value to tweak focal point for photos
  position?: string;
  onSelect: (id: string) => void;
}

const ImageChoiceCard: React.FC<Props> = ({ id, title, subtitle, src, selected, onSelect, position }) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`flex flex-col items-center p-3 border rounded-lg transition-shadow hover:shadow-md focus:outline-none ${
        selected ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200'
      }`}
    >
      <div className="w-44 h-32 mb-3 overflow-hidden rounded-md bg-gray-100 flex items-center justify-center">
        <picture>
          {/* try jpg first, fall back to svg with same base name */}
          <source srcSet={src} type="image/jpeg" />
          {/* fallback to svg if present */}
          <img
            src={src.endsWith('.jpg') ? src.replace(/\.jpg$/i, '.svg') : src}
            alt={title}
            className="object-cover w-full h-full"
            style={{ objectPosition: position || 'center' }}
          />
        </picture>
      </div>
      <div className="text-center">
        <div className="text-sm font-medium text-gray-900">{title}</div>
        {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
      </div>
    </button>
  );
};

export default ImageChoiceCard;
