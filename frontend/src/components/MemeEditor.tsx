import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import Konva from 'konva'
import { Image, Layer, Rect, Stage, Text, Transformer } from 'react-konva'
import useImage from 'use-image'

export interface TextObject {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  fontFamily: string
  fill: string
  stroke: string
  strokeWidth: number
  draggable: true
}

export interface MemeEditorHandle {
  addText: (text: string) => void
  addSticker: (emoji: string) => void
  updateText: (id: string, changes: Partial<TextObject>) => void
  deleteText: (id: string) => void
  exportCanvas: () => string
  clearTexts: () => void
}

interface MemeEditorProps {
  backgroundImage: string | null
  backgroundColor?: string
  onExport: (dataUrl: string) => void
  onSelectionChange?: (selectedText: TextObject | null) => void
  width?: number
  height?: number
}

interface ImageFit {
  x: number
  y: number
  width: number
  height: number
}

const DEFAULT_WIDTH = 800
const DEFAULT_HEIGHT = 600
const DEFAULT_BACKGROUND = '#000000'
const DEFAULT_TEXT = 'NEW TEXT'

function getImageFit(
  image: HTMLImageElement | null,
  width: number,
  height: number,
): ImageFit | null {
  if (!image) {
    return null
  }

  const scale = Math.min(width / image.width, height / image.height)
  const scaledWidth = image.width * scale
  const scaledHeight = image.height * scale

  return {
    x: (width - scaledWidth) / 2,
    y: (height - scaledHeight) / 2,
    width: scaledWidth,
    height: scaledHeight,
  }
}

function createTextObject(text: string, width: number, height: number): TextObject {
  const id = `text-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

  return {
    id,
    text: text.trim() || DEFAULT_TEXT,
    x: width / 2 - 120,
    y: height / 2 - 24,
    fontSize: 32,
    fontFamily: 'Impact',
    fill: '#ffffff',
    stroke: '#000000',
    strokeWidth: 2,
    draggable: true,
  }
}

function createStickerObject(emoji: string, width: number, height: number): TextObject {
  const id = `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

  return {
    id,
    text: emoji,
    x: width / 2 - 24,
    y: height / 2 - 24,
    fontSize: 48,
    fontFamily: 'Arial',
    fill: '#ffffff',
    stroke: '#000000',
    strokeWidth: 0,
    draggable: true,
  }
}

const MemeEditor = forwardRef<MemeEditorHandle, MemeEditorProps>(
  (
    {
      backgroundImage,
      backgroundColor = DEFAULT_BACKGROUND,
      onExport,
      onSelectionChange,
      width = DEFAULT_WIDTH,
      height = DEFAULT_HEIGHT,
    },
    ref,
  ) => {
    const [texts, setTexts] = useState<TextObject[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [bgColor, setBgColor] = useState(backgroundColor)
    const stageRef = useRef<Konva.Stage | null>(null)
    const transformerRef = useRef<Konva.Transformer | null>(null)
    const uiLayerRef = useRef<Konva.Layer | null>(null)
    const textNodeRefs = useRef<Record<string, Konva.Text | null>>({})
    const editingTextareaRef = useRef<HTMLTextAreaElement | null>(null)
    const [loadedBgImage] = useImage(backgroundImage ?? '', 'anonymous')
    const bgImage = loadedBgImage ?? null
    const imageFit = getImageFit(bgImage, width, height)

    useEffect(() => {
      setBgColor(backgroundColor)
    }, [backgroundColor])

    useEffect(() => {
      const selectedText = selectedId
        ? texts.find((text) => text.id === selectedId) ?? null
        : null

      onSelectionChange?.(selectedText)
    }, [onSelectionChange, selectedId, texts])

    useEffect(() => {
      const selectedNode = selectedId ? textNodeRefs.current[selectedId] : null

      if (selectedNode && transformerRef.current) {
        transformerRef.current.nodes([selectedNode])
      } else {
        transformerRef.current?.nodes([])
      }

      transformerRef.current?.getLayer()?.batchDraw()
    }, [selectedId, texts])

    useEffect(() => {
      return () => {
        editingTextareaRef.current?.remove()
      }
    }, [])

    const updateText = useCallback((id: string, updates: Partial<TextObject>) => {
      setTexts((currentTexts) =>
        currentTexts.map((text) =>
          text.id === id ? { ...text, ...updates } : text,
        ),
      )
    }, [])

    useImperativeHandle(ref, () => ({
      addText: (text: string) => {
        const nextText = createTextObject(text, width, height)
        setTexts((currentTexts) => [...currentTexts, nextText])
        setSelectedId(nextText.id)
      },
      addSticker: (emoji: string) => {
        const nextSticker = createStickerObject(emoji, width, height)
        setTexts((currentTexts) => [...currentTexts, nextSticker])
        setSelectedId(nextSticker.id)
      },
      updateText: (id: string, changes: Partial<TextObject>) => {
        updateText(id, changes)
      },
      deleteText: (id: string) => {
        setTexts((currentTexts) => currentTexts.filter((text) => text.id !== id))
        setSelectedId((currentSelectedId) =>
          currentSelectedId === id ? null : currentSelectedId,
        )
      },
      exportCanvas: () => {
        setSelectedId(null)
        uiLayerRef.current?.hide()
        const dataUrl = stageRef.current?.toDataURL({ pixelRatio: 2 }) ?? ''
        uiLayerRef.current?.show()
        onExport(dataUrl)

        return dataUrl
      },
      clearTexts: () => {
        setTexts([])
        setSelectedId(null)
      },
    }), [height, onExport, updateText, width])

    const handleStagePointerDown = (
      event: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
    ) => {
      const clickedEmptyCanvas =
        event.target === event.target.getStage() ||
        event.target.name() === 'canvas-background'

      if (clickedEmptyCanvas) {
        setSelectedId(null)
      }
    }

    const handleTextTransformEnd = (id: string) => {
      const node = textNodeRefs.current[id]

      if (!node) {
        return
      }

      const scaleY = node.scaleY()
      const nextFontSize = Math.max(12, Math.round(node.fontSize() * scaleY))

      node.scaleX(1)
      node.scaleY(1)
      updateText(id, {
        x: node.x(),
        y: node.y(),
        fontSize: nextFontSize,
      })
    }

    const handleTextDoubleClick = (id: string) => {
      const stage = stageRef.current
      const node = textNodeRefs.current[id]

      if (!stage || !node || editingTextareaRef.current) {
        return
      }

      const containerRect = stage.container().getBoundingClientRect()
      const textPosition = node.absolutePosition()

      // Mirror span measures real text width so the textarea grows to fit content
      const mirror = document.createElement('span')
      mirror.style.cssText = [
        'position:fixed',
        'visibility:hidden',
        'pointer-events:none',
        'white-space:pre',
        `font-size:${node.fontSize()}px`,
        `font-family:${node.fontFamily()}`,
        `line-height:${String(node.lineHeight())}`,
        'padding:4px 8px',
      ].join(';')
      document.body.appendChild(mirror)

      const textarea = document.createElement('textarea')
      editingTextareaRef.current = textarea

      node.hide()
      transformerRef.current?.hide()
      node.getLayer()?.batchDraw()

      // Max width: from text x position to the right edge of the stage
      const maxWidth = Math.max(containerRect.width - textPosition.x - 8, 200)

      textarea.value = node.text()
      textarea.style.position = 'fixed'
      textarea.style.top = `${containerRect.top + textPosition.y}px`
      textarea.style.left = `${containerRect.left + textPosition.x}px`
      textarea.style.minWidth = '160px'
      textarea.style.maxWidth = `${maxWidth}px`
      textarea.style.minHeight = '44px'
      textarea.style.border = '2px solid #7c3aed'
      textarea.style.borderRadius = '6px'
      textarea.style.padding = '4px 8px'
      textarea.style.margin = '0'
      textarea.style.overflow = 'hidden'
      textarea.style.background = 'rgba(17,17,17,0.92)'
      textarea.style.color = node.fill().toString()
      textarea.style.fontSize = `${node.fontSize()}px`
      textarea.style.fontFamily = node.fontFamily()
      textarea.style.lineHeight = String(node.lineHeight())
      textarea.style.outline = 'none'
      textarea.style.resize = 'none'
      textarea.style.zIndex = '1000'
      textarea.style.whiteSpace = 'pre-wrap'
      textarea.style.wordBreak = 'break-word'
      textarea.style.boxSizing = 'border-box'

      const autoResize = () => {
        // Measure text width using mirror so box grows with typing
        mirror.textContent = textarea.value || ' '
        const measuredWidth = Math.min(mirror.offsetWidth + 18, maxWidth)
        textarea.style.width = `${Math.max(measuredWidth, 160)}px`
        // Grow height to show all lines
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
      }

      textarea.addEventListener('input', autoResize)
      autoResize()

      let isEditingFinished = false

      const finishEditing = (shouldSave: boolean) => {
        if (isEditingFinished) return
        isEditingFinished = true

        if (shouldSave) {
          updateText(id, { text: textarea.value.trim() || DEFAULT_TEXT })
        }

        textarea.remove()
        mirror.remove()
        editingTextareaRef.current = null
        node.show()
        transformerRef.current?.show()
        node.getLayer()?.batchDraw()
      }

      textarea.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault()
          finishEditing(true)
        }

        if (event.key === 'Escape') {
          event.preventDefault()
          finishEditing(false)
        }
      })

      textarea.addEventListener('blur', () => finishEditing(true))
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
    }

    return (
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onMouseDown={handleStagePointerDown}
        onTouchStart={handleStagePointerDown}
        className="overflow-hidden rounded-[10px] bg-[#000000]"
      >
        <Layer>
          <Rect
            name="canvas-background"
            x={0}
            y={0}
            width={width}
            height={height}
            fill={bgColor}
          />
          {bgImage && imageFit ? (
            <Image
              name="canvas-background"
              image={bgImage}
              x={imageFit.x}
              y={imageFit.y}
              width={imageFit.width}
              height={imageFit.height}
            />
          ) : null}
        </Layer>

        <Layer>
          {texts.map((text) => (
            <Text
              key={text.id}
              ref={(node) => {
                textNodeRefs.current[text.id] = node
              }}
              text={text.text}
              x={text.x}
              y={text.y}
              fontSize={text.fontSize}
              fontFamily={text.fontFamily}
              fill={text.fill}
              stroke={text.stroke}
              strokeWidth={text.strokeWidth}
              draggable={text.draggable}
              onClick={() => {
                if (selectedId === text.id) {
                  handleTextDoubleClick(text.id)
                } else {
                  setSelectedId(text.id)
                }
              }}
              onTap={() => {
                if (selectedId === text.id) {
                  handleTextDoubleClick(text.id)
                } else {
                  setSelectedId(text.id)
                }
              }}
              onDblClick={() => handleTextDoubleClick(text.id)}
              onDblTap={() => handleTextDoubleClick(text.id)}
              onDragEnd={(event) => {
                updateText(text.id, {
                  x: event.target.x(),
                  y: event.target.y(),
                })
              }}
              onTransformEnd={() => handleTextTransformEnd(text.id)}
            />
          ))}
        </Layer>

        <Layer ref={uiLayerRef}>
          <Transformer
            ref={transformerRef}
            rotateEnabled={false}
            enabledAnchors={[
              'top-left',
              'top-right',
              'bottom-left',
              'bottom-right',
            ]}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 40 || newBox.height < 20) {
                return oldBox
              }

              return newBox
            }}
          />
        </Layer>
      </Stage>
    )
  },
)

MemeEditor.displayName = 'MemeEditor'

export default MemeEditor
