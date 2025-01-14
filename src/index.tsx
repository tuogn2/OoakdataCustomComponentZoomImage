/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react'
import { type FC } from 'react'
import { Retool } from '@tryretool/custom-component-support'
import ImageMagnifier from './components/ImageMagnifier'

export const ZoomImage: FC = () => {
  const [imageUrl, _setImageUrl] = Retool.useStateString({ name: 'imageUrl' })
  const [imageAlt, setImageAlt] = Retool.useStateString({ name: 'imageAlt' })
  const [zoomMode] = Retool.useStateString({
    name: 'zoomMode',
    initialValue: 'normal'
  })
  const [zoomLevel, setZoomLevel] = Retool.useStateNumber({
    name: 'zoomLevel',
    initialValue: 3
  })

  const [zoomInfo, setZoomInfo] = useState({ x: 0, y: 0, level: 1 })
  const [isDragging, setIsDragging] = useState(false)
  const [startDragPosition, setStartDragPosition] = useState<{
    x: number
    y: number
  } | null>(null)

  const [cursorPosition, setCursorPosition] = useState<{
    x: number
    y: number
  } | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)

  // const handleZoomClick = (event: React.MouseEvent) => {
  //   setZoomLevel((prev) => (prev === 1 ? 2 : 1)) // Toggle zoom levels
  //   if (zoomLevel === 1) {
  //     setPosition({ x: 0, y: 0 }) // Reset position on zoom out
  //   }
  //   event.stopPropagation()
  // }

  // Handle zoom on scroll
  const handleZoomScroll = (event: React.WheelEvent) => {
    event.preventDefault()
    if (!containerRef.current) return

    if (zoomMode !== 'normal') {
      setZoomLevel(Math.max(zoomLevel * (event.deltaY < 0 ? 1.3 : 0.75), 1))
      return
    }

    const container = containerRef.current
    const rect = container.getBoundingClientRect()
    const cursorX = event.clientX - rect.left
    const cursorY = event.clientY - rect.top

    setZoomInfo((prevZoomInfo: any) => {
      const prevZoom = prevZoomInfo.level
      let newZoom = prevZoom + (event.deltaY < 0 ? 0.12 : -0.12)
      newZoom = Math.min(Math.max(newZoom, 1), 4)
      if (newZoom === 1)
        return {
          x: 0,
          y: 0,
          level: 1
        }
      return {
        x: cursorX - ((cursorX - prevZoomInfo.x) * newZoom) / prevZoom,
        y: cursorY - ((cursorY - prevZoomInfo.y) * newZoom) / prevZoom,
        level: newZoom
      }
    })
  }

  // Start dragging
  const handleMouseDown = (event: React.MouseEvent) => {
    if (zoomInfo.level > 1) {
      setIsDragging(true)
      setStartDragPosition({
        x: event.clientX - zoomInfo.x,
        y: event.clientY - zoomInfo.y
      })
    }
  }

  // Drag the image
  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDragging && startDragPosition) {
      const newPosX = event.clientX - startDragPosition.x
      const newPosY = event.clientY - startDragPosition.y
      setZoomInfo((prev) => ({ ...prev, x: newPosX, y: newPosY }))
    }

    if (!containerRef.current) return
    const container = containerRef.current
    const rect = container.getBoundingClientRect()
    setCursorPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    })
  }

  // Stop dragging
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        margin: '0 auto',
        width: 'auto',
        height: '100%',
        overflow: 'hidden',
        borderRadius: '8px',
        cursor: zoomInfo.level > 1 && isDragging ? 'grab' : 'default'
      }}
      onWheel={handleZoomScroll}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {zoomMode !== 'normal' && cursorPosition && containerRef.current ? (
        <ImageMagnifier
          src={imageUrl}
          alt={imageAlt}
          width={'auto'}
          height={'100%'}
          magnifierWidth={zoomMode === 'glass' ? 180 : 400 / zoomLevel}
          magnifierHeight={zoomMode === 'glass' ? 180 : 400 / zoomLevel}
          mode={zoomMode}
          zoomLevel={zoomLevel}
        />
      ) : imageUrl ? (
        <img
          src={imageUrl}
          alt={imageAlt}
          style={{
            position: 'relative',
            margin: '0 auto',
            width: 'auto',
            height: '100%',
            objectFit: 'contain',
            transition: isDragging ? 'none' : 'all 200ms',
            top: zoomInfo.y,
            left: zoomInfo.x,
            transform: `scale(${zoomInfo.level})`,
            transformOrigin: '0 0'
          }}
          draggable={false}
        />
      ) : (
        <div>No image available</div>
      )}
    </div>
  )
}
