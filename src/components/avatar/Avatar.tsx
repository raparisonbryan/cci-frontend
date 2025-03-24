"use client"

import React from 'react';

interface AvatarProps {
    initials?: string;
    size?: number;
    bgColor?: string;
    textColor?: string;
    className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
                                                         initials = '',
                                                         size = 40,
                                                         bgColor = '#e0e0e0',
                                                         textColor = '#ffffff',
                                                         className = '',
                                                     }) => {

    const displayInitials = initials || 'U';

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            width={size}
            height={size}
            className={className}
            style={{ minWidth: size, minHeight: size }}
        >
            {/* Fond circulaire */}
            <circle cx="50" cy="50" r="50" fill={bgColor} />

            {/* Silhouette de la tête */}
            <circle cx="50" cy="40" r="20" fill="#9e9e9e" />

            {/* Silhouette du corps */}
            <path d="M50,65 C67,65 75,80 80,95 L20,95 C25,80 33,65 50,65 Z" fill="#9e9e9e" />

            {/* Initiales */}
            <text
                x="50"
                y="45"
                fontFamily="Arial, sans-serif"
                fontSize="20"
                fontWeight="bold"
                fill={textColor}
                textAnchor="middle"
                dominantBaseline="middle"
            >
                {displayInitials}
            </text>
        </svg>
    );
};

export default Avatar;