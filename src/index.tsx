import React, { useState } from 'react';
import { type FC } from 'react';
import { Retool } from '@tryretool/custom-component-support';

export const ZoomImage: FC = () => {
  const [imageUrl, _setImageUrl] = Retool.useStateString({
    name: 'imageUrl',
  });
  const [imageAlt, setImageAlt] = Retool.useStateString({
    name: "imageAlt", // Dynamic property for image alt text
  });

  const [zoomLevel, setZoomLevel] = useState(1); // Zoom level
  const [isDragging, setIsDragging] = useState(false); // Drag state
  const [position, setPosition] = useState({ x: 0, y: 0 }); // Image position
  const [startDragPosition, setStartDragPosition] = useState<{ x: number; y: number } | null>(null); 

  const handleZoomClick = (event: React.MouseEvent) => {
    setZoomLevel((prev) => (prev === 1 ? 2 : 1)); // Toggle zoom levels
    if (zoomLevel === 1) {
      setPosition({ x: 0, y: 0 }); // Reset position on zoom out
    }
    event.stopPropagation();
  };

  // Handle zoom on scroll
  const handleZoomScroll = (event: React.WheelEvent) => {
    event.preventDefault();
    setZoomLevel((prevZoom) => {
      let newZoom = prevZoom + (event.deltaY < 0 ? 0.1 : -0.1);
      newZoom = Math.min(Math.max(newZoom, 1), 4); // Clamp zoom levels
      if (newZoom === 1) setPosition({ x: 0, y: 0 }); // Reset position if fully zoomed out
      return newZoom;
    });
  };

  // Start dragging
  const handleMouseDown = (event: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setStartDragPosition({ x: event.clientX - position.x, y: event.clientY - position.y });
    }
  };

  // Drag the image
  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDragging && startDragPosition) {
      const newPosX = event.clientX - startDragPosition.x;
      const newPosY = event.clientY - startDragPosition.y;
      setPosition({ x: newPosX, y: newPosY });
    }
  };

  // Stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden', // Ensures no scrollbars appear
        borderRadius: '8px',
        cursor: isDragging ? 'grabbing' : zoomLevel > 1 ? 'grab' : 'zoom-in',
      }}
      onWheel={handleZoomScroll}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleZoomClick}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={imageAlt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain', // Ensures the image fits without cropping
            transition: isDragging ? 'none' : 'transform 0.3s ease',
            transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
          }}
          draggable={false}
        />
      ) : (
        <div>No image available</div>
      )}
    </div>
  );
};
