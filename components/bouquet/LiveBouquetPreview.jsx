'use client'

import React, { useMemo } from 'react'
import { useBouquetStore } from '@/lib/store'
import { FLOWER_ASSETS } from '@/lib/flowerAssets'

function LiveBouquetPreviewComponent() {
  const store = useBouquetStore()
  const flowers = useMemo(() => store.flowers.slice(0, 10), [store.flowers])

  const getPosition = (index, total) => {
    let row, col, rowTotal

    if (total <= 3) {
      row = 1; col = index; rowTotal = total
    } else if (total <= 6) {
      if (index < Math.ceil(total / 2)) {
        row = 0; col = index; rowTotal = Math.ceil(total / 2)
      } else {
        row = 1; col = index - Math.ceil(total / 2); rowTotal = Math.floor(total / 2)
      }
    } else {
      const rowSizes = [3, 4, 3]
      const rowSizesActual = total <= 8
        ? [Math.ceil(total / 3), Math.ceil(total / 3), total - 2 * Math.ceil(total / 3)]
        : rowSizes
      if (index < rowSizesActual[0]) {
        row = 0; col = index; rowTotal = rowSizesActual[0]
      } else if (index < rowSizesActual[0] + rowSizesActual[1]) {
        row = 1; col = index - rowSizesActual[0]; rowTotal = rowSizesActual[1]
      } else {
        row = 2; col = index - rowSizesActual[0] - rowSizesActual[1]; rowTotal = rowSizesActual[2]
      }
    }

    const spreads = [140, 185, 165]
    const spread = spreads[row] || 165
    const centerX = 155
    const t = rowTotal <= 1 ? 0.5 : col / (rowTotal - 1)
    const x = centerX - spread / 2 + t * spread

    // ✅ Rows sit higher in the container — heads above wrap, stems inside wrap
    const rowYs = [20, 95, 160]
    const y = rowYs[row] ?? 20

    const sizes = [88, 102, 115]
    const size = sizes[row] ?? 100

    // ✅ z stays low — wrap will layer above stems at z:20
    const zBase = [2, 5, 8]
    const z = (zBase[row] ?? 2) + col

    const tilt = (t - 0.5) * -22

    return { x, y, size, z, tilt }
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/*
        ✅ Single relative container — flowers + wrap live here together.
        Tall enough (480px) to hold dome area + wrap below.
      */}
      <div
        style={{
          position: 'relative',
          width: '320px',
          height: '480px',
          flexShrink: 0,
        }}
      >
        {/* FLOWERS — positioned in upper portion of container */}
        {flowers.map((flower, i) => {
          const asset = FLOWER_ASSETS[flower.flowerType]
          if (!asset) return null
          const { x, y, size, z, tilt } = getPosition(i, flowers.length)

          return (
            <img
              key={flower.id ?? i}
              src={asset.imageUrl}
              alt=""
              style={{
                position: 'absolute',
                left: `${x}px`,
                top: `${y}px`,
                transform: `translateX(-50%) rotate(${tilt}deg)`,
                transformOrigin: 'bottom center',
                width: `${size}px`,
                height: `${size}px`,
                objectFit: 'contain',
                zIndex: z,            // z: 2–18
                pointerEvents: 'none',
                filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.25))',
              }}
            />
          )
        })}

        {/*
          WRAP — anchored to bottom of container.
          ✅ zIndex: 20 puts it ABOVE all flower stems (z: 2–18)
             but flower HEADS still show because they extend above the wrap's top edge.
          This creates the "flowers sitting inside the wrap" illusion.
        */}
        <img
          src="/bouquet-assets/wrap.png"
          alt=""
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '310px',
            height: 'auto',
            zIndex: 20,
            pointerEvents: 'none',
            filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.35))',
          }}
        />

        {/* EMPTY STATE */}
        {flowers.length === 0 && (
          <div
            style={{
              position: 'absolute',
              top: '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              color: 'rgba(255,255,255,0.5)',
              fontSize: '14px',
              width: '200px',
              zIndex: 25,
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.6 }}>✿</div>
            <div>Select flowers to preview your bouquet</div>
          </div>
        )}
      </div>
    </div>
  )
}

export const LiveBouquetPreview = React.memo(LiveBouquetPreviewComponent)
export default LiveBouquetPreview