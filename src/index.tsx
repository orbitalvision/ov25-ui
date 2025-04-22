import { useState, useRef, useEffect, } from "react"
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Check,  Heart, ShoppingCart } from "lucide-react"
import 'overlayscrollbars/overlayscrollbars.css';
import { OverlayScrollbars } from 'overlayscrollbars';

import { Button } from "./components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select"
import { ProductGallery } from "./components/product-gallery"
import { ProductOptions } from "./components/product-options"
import {ProductVariants, VariantCardProps} from "./components/product-variants"
import { Badge } from "./components/ui/badge"
import { cn } from "./utils/cn"
import { Skeleton } from "./components/ui/skeleton"

import { TwoStageDrawer } from "./components/ui/two-stage-drawer";

import ArPreviewQRCodeDialog from "./components/ui/ar-preview-qr-code-dialog";
import { useMediaQuery } from "./hooks/use-media-query";
import '../globals.css'
interface Product {
  id: number
  name: string
  price: number
  lowestPrice: number
  metadata: any
}

interface Selection {
  id: number
  name: string
  thumbnail?: string
  price: number
  blurHash: string
  groupId?: number
}

interface Group {
  id: number
  name: string
  selections: Selection[]
}

interface Option {
  id: number | 'size'
  name: string
  groups: Group[]
}

interface ConfiguratorState {
  options: Option[]
  selectedSelections: Array<{
    optionId: number
    groupId: number
    selectionId: number
  }>
}

interface SizeOption {
  id: 'size'
  name: 'size'
  groups: [{
    id: 'size-group'
    name: 'Size Options'
    selections: Array<{
      id: number
      name: string
      price: number
      thumbnail?: string
    }>
  }]
}

export type DrawerSizes = 'closed' | 'small' | 'large'

const SizeVariantCard = ({ variant, onSelect, index }: VariantCardProps) => {
    return (
      <button
        onClick={() => onSelect(variant)}
        className={`relative flex flex-col  h-[160px] md:h-[200px] xl:h-[217px] items-center gap-4 w-full p-4  text-left  hover:bg-accent xl:border-t border-[#E5E5E5] text-[#282828] ${index % 2 === 0 ? 'xl:border-r border-[#E5E5E5]' : ''}`}
      >
          <div className="flex flex-1 items-center justify-between">
            <div className="flex flex-col justify-center items-center">
              <h3 className="font-[350] text-sm">{variant.name}</h3>
              <p className="text-[12px] font-[350] mt-0.5 ">£{(variant?.data?.price / 100)}</p>
            </div>
          </div>
          <div className="relative aspect-[3/4] max-w-[200px] w-full  overflow-hidden rounded-md bg-muted">
            <img src={variant.image || "/placeholder.svg"} alt={variant.name} fill  className="object-cover"/>
            {/* <div className="w-full h-full bg-red-400"></div> */}
            {variant.isSelected && (
              <div className="absolute inset-0 bg-transparent">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between w-full -mt-4">
            <div className="flex items-center gap-2 w-full">
              <div className="flex items-center flex-1">
                <div className="w-[2px] h-3 bg-[#E5E5E5]"></div>
                <div className="h-[2px] flex-1 bg-[#E5E5E5]"></div>
              </div>
              <span className="text-[12px] font-[350] whitespace-nowrap">{variant?.data?.dimensionX}cm</span>
              <div className="flex items-center flex-1">
                <div className="h-[2px] flex-1 bg-[#E5E5E5]"></div>
                <div className="w-[2px] h-3 bg-[#E5E5E5]"></div>
              </div>
            </div>
          </div>
      </button>
    )
  }


  const LegsVariantCard = ({ variant, onSelect, index, isMobile }: VariantCardProps) => {
    return (
      <button
        onClick={() => onSelect(variant)}
        className={`relative flex flex-col h-[160px] md:h-[200px] xl:h-[217px] items-center gap-4 w-full p-6 py-4 bg-white text-left  hover:bg-accent xl:border-t border-[#E5E5E5] text-[#282828] group ${index % 2 === 0 ? 'xl:border-r border-[#E5E5E5]' : ''}`}
      >
        <div className="relative aspect-square h-full bg-white group-hover:bg-accent ">
          <div className="absolute inset-0 rounded-full overflow-hidden bg-white group-hover:bg-accent ">
            <div className="relative w-full h-full">
            {!isMobile ? (
            <img punch={1} src={variant.image || "/placeholder.svg"} alt={variant.name} className="object-cover w-full h-full" blurhash={variant.blurHash} />

            ) : (
                // <div className="w-full h-full bg-red-400"></div>

            <img src={variant.image || "/placeholder.svg"} alt={variant.name} className="object-cover w-full h-full" width={100} height={100} />
            )}
              {variant.isSelected && (
                <div className="absolute inset-0 ">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-between">
          <div className="flex flex-col justify-center items-center">
            <h3 className="font-[350] text-[12px]">{variant.name}</h3>
          </div>
        </div>
      </button>
    )
  }
    

export const APP = ({productId = null, rangeId = null}: {productId?: number | null, rangeId?: number | null}) => {

  const [isVariantsOpen, setIsVariantsOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [currentProductId, setCurrentProductId] = useState<number>()
  const [configuratorState, setConfiguratorState] = useState<ConfiguratorState>()
  const [selectedSelections, setSelectedSelections] = useState<Array<{optionId: number | 'size', groupId?: number, selectionId: number}>>([])
  const [activeOptionId, setActiveOptionId] = useState<'size' | number | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [price, setPrice] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [currentSku, setCurrentSku] = useState<any>(null)
  const [range, setRange] = useState<any>(null)
  const mainContentRef = useRef<HTMLDivElement>(null)
  const osInstanceRef = useRef<any>(null)
  const [drawerSize, setDrawerSize] = useState<DrawerSizes>("closed")
  const [currentOptionIndex, setCurrentOptionIndex] = useState(0)
  const [arPreviewLink, setArPreviewLink] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [canAnimate, setCanAnimate] = useState<boolean>(false)
  const [animationState, setAnimationState] = useState<'unavailable' | 'open' | 'close' | 'loop' | 'stop'>('unavailable');
  const [isOpened, setIsOpened] = useState(false);


  const isMobile = useMediaQuery(1280)

  useEffect(() => {
    if (configuratorState?.selectedSelections) {
      setSelectedSelections(configuratorState.selectedSelections)
    }
  }, [configuratorState])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const { type, payload } = event.data
        
        // Skip if no payload or type
        if (!type) {
          return;
        }

        
        // Handle empty payload as empty object
        const data = payload ? JSON.parse(payload) : {}

        switch (type) {
          case 'ALL_PRODUCTS':
            setProducts(data)
            break
          case 'CURRENT_PRODUCT_ID':
            setCurrentProductId(data)
            break
          case 'ANIMATION_STATE':
            setCanAnimate(data !== 'unavailable');
            setAnimationState(data);
            break
          case 'CONFIGURATOR_STATE':
            setConfiguratorState(data)
            break
          case 'CURRENT_PRICE':
            setPrice(data.totalPrice)
            break
          case 'CURRENT_SKU':
            setCurrentSku(data)
            break
          case 'RANGE':
            setRange(data)
            break
          case 'AR_PREVIEW_LINK':
            setArPreviewLink(data)
            break
          case 'ERROR':
            setError(new Error(data))
            break
        }
      } catch (error) {
        console.error('Error handling message:', error, 'Event data:', event.data)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  useEffect(() => {
    if (mainContentRef.current && !osInstanceRef.current) {
      osInstanceRef.current = OverlayScrollbars(mainContentRef.current, {
        scrollbars: {
          theme: 'os-theme-dark',
          visibility: 'auto',
          autoHide: 'move',
          autoHideDelay: 800,
          dragScroll: true,
          clickScroll: true,
        },
        overflow: {
          x: 'hidden',
          y: isVariantsOpen && isMobile ? 'hidden' : 'scroll'
        },
        update: {
          elementEvents: [
            ['*', 'wheel'],
            ['*', 'touch'],
            ['*', 'scroll']
          ]
        }
      });
      
      return () => {
        if (osInstanceRef.current) {
          osInstanceRef.current.destroy();
          osInstanceRef.current = null;
        }
      };
    }
  }, []); // Only run once on mount


  const currentProduct = products?.find(p => p.id === currentProductId)
  const activeOption = configuratorState?.options?.find(opt => opt.id === activeOptionId)

  // Create a virtual size option from products
  const sizeOption: SizeOption = {
    id: 'size',
    name: 'size',
    groups: [{
      id: 'size-group',
      name: 'Size Options',
      selections: products?.map(p => ({
        id: p?.id,
        name: p?.name,
        price: p?.price,
        thumbnail: p?.metadata?.images?.length > 0 ? p?.metadata?.images[p?.metadata?.images?.length - 1] : null
      })) || []
    }]
  }

  // Combine size option with configurator options, only including size option if multiple products exist
  const allOptions = [
    ...(products?.length > 1 ? [sizeOption] : []),
    ...(configuratorState?.options || [])
  ]
  

  const getSelectedValue = (option: Option | SizeOption) => {
    if (option.id === 'size') {
      return currentProduct?.name || ''
    }

    const selectedSelection = selectedSelections.find(
      sel => sel.optionId === option.id
    )
    if (!selectedSelection) return ''

    const group = option.groups.find(g => g.id === selectedSelection.groupId)
    const selection = group?.selections.find(s => s.id === selectedSelection.selectionId)
    return selection?.name || ''
  }

  const handleOptionClick = (optionId: number | 'size') => {
    setActiveOptionId(optionId)
    setIsVariantsOpen(true)
  }

  const sendMessageToIframe = (type: string, payload: any) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type,
        payload: JSON.stringify(payload)
      }, '*')
    }
  }

  const handleSelectionSelect = (selection: Selection) => {
    if (activeOptionId === 'size') {
      if (currentProductId !== selection.id) {
        setSelectedSelections(prev => {
          const newSelections = prev.filter(sel => sel.optionId !== 'size')
          return [...newSelections, { optionId: 'size', selectionId: selection.id }]
        })
        sendMessageToIframe('SELECT_PRODUCT', selection.id)
      }
      return
    }

    if (typeof activeOptionId === 'number') {
      setSelectedSelections(prev => {
        const newSelections = prev.filter(sel => sel.optionId !== activeOptionId)
        return [...newSelections, { 
          optionId: activeOptionId, 
          groupId: selection.groupId, 
          selectionId: selection.id 
        }]
      })
      sendMessageToIframe('SELECT_SELECTION', {
        optionId: activeOptionId, 
        groupId: selection.groupId, 
        selectionId: selection.id
      })
    }
  }

  const hasRequiredData = products?.length > 0 && currentProductId && configuratorState

  // Add navigation functions
  const handleNextOption = () => {
    const newIndex = (currentOptionIndex + 1) % allOptions?.length
    setCurrentOptionIndex(newIndex)
    setActiveOptionId(allOptions[newIndex].id)
  }

  const handlePreviousOption = () => {
    const newIndex = (currentOptionIndex - 1 + allOptions?.length) % allOptions?.length
    setCurrentOptionIndex(newIndex)
    setActiveOptionId(allOptions[newIndex].id)
  }




  return (<>

    <ArPreviewQRCodeDialog arPreviewLink={arPreviewLink} setArPreviewLink={setArPreviewLink} />
    <div className={cn(" min-h-screen w-full  items-center flex-col bg-background", !hasRequiredData && !error ? 'flex' : 'hidden' )}>
        <div className=" h-screen w-full flex flex-col items-center" >
          <main className="flex flex-col w-full max-w-[2300px] xl:flex-row flex-1 gap-8 p-8">
            <div className="relative flex-1 max-h-fit xl:min-w-[26rem]">
              <div className="absolute inset-0 opacity-0 xl:max-h-screen ">
               
              </div>
              <Skeleton className="w-full aspect-square md:aspect-[3/2] xl:aspect-video" />
            </div>
            <div className="w-full max-w-[800px]">
              <div className="sticky top-8 flex flex-col gap-6">
                <div className="space-y-4">
                  <Skeleton className="h-8 w-[250px]" />
                  <Skeleton className="h-6 w-[100px]" />
                  <Skeleton className="h-5 w-[120px]" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Skeleton className="h-14 w-[120px]" />
                    <Skeleton className="h-14 flex-1" />
                    <Skeleton className="h-14 w-12" />
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

    <div className={cn("  h-screen min-h-screen w-full items-center flex-col ",  !hasRequiredData && !error ? 'hidden' : 'flex')}>
      <main className="flex min-h-full  w-full max-w-[2300px]  flex-col xl:flex-row xl:gap-8 py-8 pt-0 xl:pt-8 xl:px-8" data-overlayscrollbars-initialize>
        <div className={cn("relative    flex-grow-1 max-w-[100vh] 2xl:max-w-[120vh]   w-full   0 xl:sticky z-[3]  duration-600 transform", isMobile  && isVariantsOpen ? 'sticky' : '')} style={{ top: '0rem' }}>
            <div className={cn("absolute inset-0 w-full h-full flex justify-center items-start z-[4] pointer-events-none", isMobile && isVariantsOpen ? '' : 'hidden')}>
                <div className="rounded-full  relative bg-white  border-[#E5E5E5] shadow-sm px-4 pr-3.5 py-0 flex items-center mt-4 gap-2 pointer-events-auto">
                    <p className="text-sm text-[#282828]">£{(price / 100).toFixed(2)}</p>
                    <div className="w-[1px] -mt-4 h-12 bg-[#E5E5E5]"></div>
                    <ShoppingCart className="w-4 h-4 text-[#282828]" />
                </div>
            </div>
            <ProductGallery 
            iframeRef={iframeRef} 
            images={currentProduct?.metadata?.images?.slice(0, -1) || []} 
            currentIndex={galleryIndex}
            onIndexChange={setGalleryIndex}
            productId={productId}
            rangeId={rangeId}
            error={error}
            canAnimate={canAnimate}
            showDimensionsToggle={!!((currentProduct as any)?.dimensionX && (currentProduct as any)?.dimensionY && (currentProduct as any)?.dimensionZ)}
            animationState={animationState}
            />
        </div>

         {!error && (
          <div className=" flex-1 flex-shrink-0 xl:min-w-[494px] bg-white  xl:px-0">
            <div className="flex flex-col gap-6 pt-8 xl:pt-0">
              <div className="flex flex-col gap-2 px-4 xl:px-0.5">
                <h1 className="text-3xl ">{range?.name ?? currentProduct?.name } </h1>
                <p className="text-2xl">£{(price / 100).toFixed(2)}</p>
                <Badge className="text-xs text-neutral-500 px-2.5 py-1 rounded-[2px] bg-[#EEEEEE] max-w-fit shadow-none font-normal ">
                  Made to Order
                </Badge>
              </div>

              <div className="relative">
                <div
                  className={`w-full  duration-300 ease-in-out ${
                    !isMobile && (isVariantsOpen ? "opacity-0 invisible translate-x-[-100%]" : "opacity-100 visible translate-x-0")
                    
                  }
                
                `}
               
                > 
                  <div>
                    {allOptions.map((option, index) => (
                    
                      <ProductOptions
                        key={option?.id}
                        label={'Select ' + option?.name}
                        value={option?.name === 'size' ? range?.name + ' ' + getSelectedValue(option) : getSelectedValue(option)}
                        onClick={() => handleOptionClick(option?.id)}
                      />
                    ))}
                  </div>
                </div>
                {isMobile ? 
                (<TwoStageDrawer
                isOpen={isVariantsOpen}
                onOpenChange={setIsVariantsOpen}
                onStateChange={(value) => setDrawerSize(value === 0 ? 'closed' : value === 1 ? 'small' : 'large')}
                className="z-[10]"

                >
                <div
                  className={`w-full  duration-300 ease-in-out absolute top-0 left-0 ${
                    !isMobile && (isVariantsOpen ? "opacity-100 visible translate-x-0" : "opacity-0 invisible translate-x-[100%]")
                  }`}
                >
                  {activeOptionId === 'size' && (
                    <ProductVariants
                      isOpen={isVariantsOpen}
                      gridDivide={2}
                      onClose={() => setIsVariantsOpen(false)}
                      title="Size"
                      variants={sizeOption.groups[0].selections.map(selection => ({
                        id: selection?.id,
                        name: selection?.name,
                        price: selection?.price,
                        image: selection?.thumbnail || '/placeholder.svg?height=200&width=200',
                        blurHash: (selection as any)?.blurHash,
                        data: products?.find(p => p?.id === selection?.id),
                        isSelected: selection.id === currentProductId || selectedSelections.some(
                          sel => sel.optionId === 'size' && sel.selectionId === selection.id
                        )
                      }))}
                      VariantCard={SizeVariantCard}
                      drawerSize={drawerSize}
                      onSelect={handleSelectionSelect}
                      onNext={handleNextOption}
                      onPrevious={handlePreviousOption}
                    />
                  )}
                  {activeOptionId !== 'size' && activeOptionId !== 1 && activeOptionId !== null && (
                    <ProductVariants
                      isOpen={isVariantsOpen}
                      basis={'basis-[33%]'}
                      gridDivide={4}
                      onClose={() => setIsVariantsOpen(false)}
                      title={`${activeOption?.name || ''}`}
                      variants={activeOption?.groups?.map(group => ({
                        groupName: group?.name,
                        variants: group?.selections?.map(selection => ({
                          id: selection?.id,
                          groupId: group?.id,
                          optionId: activeOption?.id,
                          name: selection?.name,
                          price: selection?.price,
                          image: selection.thumbnail || '/placeholder.svg?height=200&width=200',
                          blurHash: (selection as any).blurHash,
                          isSelected: selectedSelections.some(
                            sel => sel.optionId === activeOption.id && 
                                  sel.groupId === group.id && 
                                  sel.selectionId === selection.id
                          )
                        })).sort((a, b) => a.name.localeCompare(b.name))
                      })) || []}
                      drawerSize={drawerSize}
                      onSelect={handleSelectionSelect}
                      onNext={handleNextOption}
                      onPrevious={handlePreviousOption}
                    />
                  )}
                  {activeOptionId === 1 && (
                    <ProductVariants
                      isOpen={isVariantsOpen}
                      gridDivide={2}
                      onClose={() => setIsVariantsOpen(false)}
                      title={`${activeOption?.name || ''}`}
                      variants={activeOption?.groups?.map(group => ({
                        groupName: group.name,
                        variants: group?.selections?.map(selection => ({
                          id: selection.id,
                          groupId: group.id,
                          optionId: activeOption.id,
                          name: selection.name,
                          price: selection.price,
                          image: selection.thumbnail || '/placeholder.svg?height=200&width=200',
                          blurHash: (selection as any).blurHash,
                          isSelected: selectedSelections.some(
                            sel => sel.optionId === activeOption.id && 
                                  sel.groupId === group.id && 
                                  sel.selectionId === selection.id
                          )
                        })).sort((a, b) => a.name.localeCompare(b.name))
                      })) || []}
                      VariantCard={activeOption?.name?.toLowerCase().includes('leg') ? LegsVariantCard : undefined}
                      drawerSize={drawerSize}
                      onSelect={handleSelectionSelect}
                      onNext={handleNextOption}
                      onPrevious={handlePreviousOption}
                    />
                  )}
                  
                </div>
                </TwoStageDrawer>) : (
                    <div
                  className={`w-full  duration-300 ease-in-out absolute top-0 left-0 ${
                    isVariantsOpen ? "opacity-100 visible translate-x-0" : "opacity-0 invisible translate-x-[100%]"
                  }`}
                >
                  {activeOptionId === 'size' && (
                    <ProductVariants
                      isOpen={isVariantsOpen}
                      gridDivide={2}
                      onClose={() => setIsVariantsOpen(false)}
                      title="Size"
                      variants={sizeOption?.groups[0]?.selections?.map(selection => ({
                        id: selection?.id,
                        name: selection?.name,
                        price: selection?.price,
                        image: selection?.thumbnail || '/placeholder.svg?height=200&width=200',
                        blurHash: (selection as any)?.blurHash,
                        data: products?.find(p => p?.id === selection?.id),
                        isSelected: selection.id === currentProductId || selectedSelections.some(
                          sel => sel.optionId === 'size' && sel.selectionId === selection.id
                        )
                      }))}
                      VariantCard={SizeVariantCard}
                      drawerSize={drawerSize}
                      onSelect={handleSelectionSelect}
                      onNext={handleNextOption}
                      onPrevious={handlePreviousOption}
                    />
                  )}
                  {activeOptionId !== 'size' && activeOptionId !== 1 && activeOptionId !== null && (
                    <ProductVariants
                      isOpen={isVariantsOpen}
                      gridDivide={4}
                      onClose={() => setIsVariantsOpen(false)}
                      title={`${activeOption?.name || ''}`}
                      variants={activeOption?.groups?.map(group => ({
                        groupName: group?.name,
                        variants: group?.selections?.map(selection => ({
                          id: selection?.id,
                          groupId: group?.id,
                          optionId: activeOption?.id,
                          name: selection?.name,
                          price: selection?.price,
                          image: selection.thumbnail || '/placeholder.svg?height=200&width=200',
                          blurHash: (selection as any).blurHash,
                          isSelected: selectedSelections.some(
                            sel => sel.optionId === activeOption.id && 
                                  sel.groupId === group.id && 
                                  sel.selectionId === selection.id
                          )
                        })).sort((a, b) => a.name.localeCompare(b.name))
                      })) || []}
                      drawerSize={drawerSize}
                      onSelect={handleSelectionSelect}
                      onNext={handleNextOption}
                      basis={'basis-[33%]'}
                      onPrevious={handlePreviousOption}
                    />
                  )}
                  {activeOptionId === 1 && (
                    <ProductVariants
                      isOpen={isVariantsOpen}
                      gridDivide={2}
                      onClose={() => setIsVariantsOpen(false)}
                      title={`${activeOption?.name || ''}`}
                      variants={activeOption?.groups?.map(group => ({
                        groupName: group.name,
                        variants: group?.selections?.map(selection => ({
                          id: selection?.id,
                          groupId: group?.id,
                          optionId: activeOption?.id,
                          name: selection?.name,
                          price: selection?.price,
                          image: selection?.thumbnail || '/placeholder.svg?height=200&width=200',
                          blurHash: (selection as any)?.blurHash,
                          isSelected: selectedSelections.some(
                            sel => sel.optionId === activeOption.id && 
                                  sel.groupId === group.id && 
                                  sel.selectionId === selection.id
                          )
                        })).sort((a, b) => a.name.localeCompare(b.name))
                      })) || []}
                      VariantCard={activeOption?.name?.toLowerCase().includes('leg') ? LegsVariantCard : undefined}
                      drawerSize={drawerSize}
                      onSelect={handleSelectionSelect}
                      onNext={handleNextOption}
                      onPrevious={handlePreviousOption}
                    />
                  )}
                  
                </div>

                )
              }
              </div>

              <div className={cn("space-y-4 pt-6 w-full ", !isVariantsOpen? '' : 'hidden', isMobile && isVariantsOpen ? 'hidden' : '')}>
                <div className="flex items-end gap-4 xl:gap-2 px-1">
                  <div className="max-w-[100px] xl:max-w-full flex flex-col gap-2">
                    <span className="text-xs text-muted-foreground">QUANTITY</span>
                    <Select
                      value={quantity.toString()}
                      onValueChange={(value) => setQuantity(parseInt(value))}
                    >
                      <SelectTrigger className="w-[60px] xl:w-[120px] py-[1.375rem] rounded-[3px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="flex-1 py-[1.425rem] rounded-[3px]  bg-[#282828] text-white font-[500]" variant='black'>Add To Basket</Button>
                  <Button variant="outline" size="icon" className={cn("aspect-square w-[2.85rem] h-[2.85rem]  p-0 rounded-[3px]", activeOptionId === null ? '' : '')}>
                    <Heart className="h-16 w-16 scale-125 text-[#282828] z-[-0]" />
                  </Button>
                </div>
              </div>
              <div className="w-full flex justify-center items-center">
                  <p className="text-xs text-muted-foreground">SKU: {currentSku?.skuString}</p>
              </div>
            </div>
          </div>
          )}
      </main>
    </div>
    </>)
}

export default APP

// Render the React application
const rootElement = document.getElementById('root')
if (rootElement) {
  const root = createRoot(rootElement)
  root.render(<APP />)
}


