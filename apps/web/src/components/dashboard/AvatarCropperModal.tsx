'use client'

import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { getCroppedImg } from '@/utils/cropImage'
import { X, Check } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

interface Props {
  imageSrc: string
  onComplete: (croppedFile: File, previewUrl: string) => void
  onCancel: () => void
}

export default function AvatarCropperModal({ imageSrc, onComplete, onCancel }: Props) {
  const { t } = useTranslation()
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleSave = async () => {
    if (!croppedAreaPixels) return
    setIsProcessing(true)
    try {
      const croppedImageFile = await getCroppedImg(imageSrc, croppedAreaPixels, 'avatar.jpeg')
      if (croppedImageFile) {
        const previewUrl = URL.createObjectURL(croppedImageFile)
        onComplete(croppedImageFile, previewUrl)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-sm border border-zinc-200 shadow-xl w-full max-w-lg overflow-hidden flex flex-col h-[80vh] max-h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200">
          <h3 className="text-[11px] font-bold tracking-widest uppercase text-zinc-900">
            {t('profile.actions.cropAvatar') || 'Crop Avatar (4x6)'}
          </h3>
          <button type="button" onClick={onCancel} className="text-zinc-400 hover:text-red-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative flex-1 bg-zinc-100">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={4 / 6}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        {/* Footer Controls */}
        <div className="p-6 border-t border-zinc-200 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Zoom</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-zinc-900"
            />
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 text-[11px] font-bold tracking-widest uppercase text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-sm transition-colors"
            >
              {t('profile.actions.cancel') || 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 text-[11px] font-bold tracking-widest uppercase text-white bg-zinc-900 hover:bg-zinc-800 rounded-sm transition-colors disabled:opacity-50"
            >
              <Check size={14} />
              {isProcessing ? (t('profile.saving') || 'Saving...') : (t('profile.actions.confirm') || 'Confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
