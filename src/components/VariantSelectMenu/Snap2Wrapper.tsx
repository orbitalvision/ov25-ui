import React, { useCallback, useState, useEffect } from 'react';
import { Variant } from './ProductVariants.js';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
import {
  closeModuleSelectMenu,
  selectModule,
  CompatibleModule,
  snap2SceneContainsModule,
} from '../../utils/configurator-utils.js';
import { ModuleVariantCard } from './variant-cards/ModuleVariantCard.js';
import { VariantsHeader } from './VariantsHeader.js';
import { Snap2VariantSheetColumn } from '../Snap2VariantSheetColumn.js';
import { Snap2ModulesOptionBody } from './Snap2ModulesOptionBody.js';
import { Snap2ModulesEmptyState } from './Snap2ModulesEmptyState.js';
import { ProductVariantsWrapper } from './ProductVariantsWrapper.js';
import { Carousel, CarouselContent, CarouselItem } from '../ui/carousel.js';

export interface Snap2WrapperProps {
  isInline?: boolean;
  embeddedInVariantsOnlySheet?: boolean;
  snap2ModulesOnlySideSheet?: boolean;
}

type Snap2PiecesOptionsLayoutProps = Pick<Snap2WrapperProps, 'isInline' | 'embeddedInVariantsOnlySheet'>;

type Snap2PiecesPanelProps = {
  isInline: boolean;
  embeddedInVariantsOnlySheet: boolean;
  hideVariantsHeader?: boolean;
  onCloseHeaderOverride?: () => void;
};

function Snap2PiecesPanel({
  isInline,
  embeddedInVariantsOnlySheet,
  hideVariantsHeader = false,
  onCloseHeaderOverride,
}: Snap2PiecesPanelProps) {
  const {
    isVariantsOpen,
    setIsVariantsOpen,
    isMobile,
    drawerSize,
    compatibleModules,
    isModuleSelectionLoading,
    setIsModuleSelectionLoading,
    configuratorState,
  } = useOV25UI();

  const hasSnap2Objects = (configuratorState?.snap2Objects?.length ?? 0) > 0;

  const handleClosePieces = () => {
    closeModuleSelectMenu();
    setIsVariantsOpen(false);
  };

  const handleModuleSelect = useCallback(
    (variant: Variant) => {
      if (isModuleSelectionLoading) return;
      const module = variant.data as CompatibleModule;
      const modelPath = module?.model?.modelPath;
      const modelId = module?.model?.modelId;
      if (!modelPath || !modelId) return;
      setIsModuleSelectionLoading(true);
      selectModule({ modelPath, modelId });
    },
    [isModuleSelectionLoading, setIsModuleSelectionLoading]
  );

  if (isMobile && !isInline) {
    if (!hasSnap2Objects) {
      return (
        <div className="ov:flex ov:flex-col ov:items-center ov:justify-center ov:py-8 ov:space-y-4">
          <p className="ov:text-sm ov:text-(--ov25-secondary-text-color)">Loading...</p>
        </div>
      );
    }
    if (compatibleModules === null) {
      return (
        <div className="ov:flex ov:flex-col ov:items-center ov:justify-center ov:py-8 ov:space-y-4">
          <p className="ov:text-sm ov:text-(--ov25-secondary-text-color)">Loading...</p>
        </div>
      );
    }
    if (compatibleModules.length === 0) {
      return <Snap2ModulesEmptyState />;
    }
    return (
      <div className="ov:md:flex ov:md:flex-col ov:max-h-full ov:h-full ov:md:bg-(--ov25-background-color) ov:xl:border-(--ov25-border-color) ov:w-full">
        <VariantsHeader onCloseButtonClick={handleClosePieces} />
        <div className="ov:flex ov:min-h-0 ov:flex-1 ov:flex-col ov:overflow-hidden ov:px-2 ov:pb-4">
          <Carousel
            className="ov:w-full ov:min-h-0 ov:flex-1 ov:min-w-0"
            opts={{ align: 'start', containScroll: 'trimSnaps' }}
          >
            <CarouselContent className="ov:-ml-2 ov:min-h-0">
              {compatibleModules.map((module, index) => {
                const variant: Variant = {
                  id: `${module.productId}-${module.model.modelId}`,
                  name: module.product.name,
                  price: 0,
                  image: module.product.hasImage ? module.product.imageUrl : '/placeholder.svg?height=200&width=200',
                  blurHash: '',
                  data: module,
                  isSelected: snap2SceneContainsModule(
                    configuratorState?.snap2Objects,
                    module.productId,
                    module.model.modelId
                  ),
                };
                return (
                  <CarouselItem
                    key={`${module.productId}-${module.model.modelId}`}
                    className="ov:basis-[min(84vw,22rem)] ov:shrink-0 ov:pl-2"
                  >
                    <ModuleVariantCard
                      variant={variant}
                      onSelect={handleModuleSelect}
                      index={index}
                      isMobile={isMobile}
                      isLoading={isModuleSelectionLoading}
                      className="ov:mb-0"
                      thumbDualClassName="ov:p-[0.5rem] ov:px-2"
                    />
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    );
  }

  return (
    <div
      className="ov25-snap2-pieces-panel ov:flex ov:flex-col ov:flex-1 ov:min-h-0 ov:overflow-hidden ov:bg-(--ov25-background-color)"
      data-ov25-snap2-pieces-panel="true"
    >
      {!embeddedInVariantsOnlySheet && !isInline && !hideVariantsHeader && (
        <VariantsHeader onCloseButtonClick={onCloseHeaderOverride} />
      )}
      <div className="ov:flex-1 ov:min-h-0 ov:overflow-y-auto ov:md:px-0">
        <Snap2ModulesOptionBody />
      </div>
    </div>
  );
}

function Snap2ModulesOnlySheetInner({
  isInline = false,
  embeddedInVariantsOnlySheet = false,
}: Pick<Snap2WrapperProps, 'isInline' | 'embeddedInVariantsOnlySheet'>) {
  const { setIsModulePanelOpen } = useOV25UI();
  const handleCloseModulesSideSheetHeader = useCallback(() => {
    setIsModulePanelOpen(false);
    closeModuleSelectMenu();
  }, [setIsModulePanelOpen]);

  return (
    <Snap2PiecesPanel
      isInline={isInline}
      embeddedInVariantsOnlySheet={embeddedInVariantsOnlySheet}
      onCloseHeaderOverride={handleCloseModulesSideSheetHeader}
    />
  );
}

function Snap2PiecesOptionsLayout({
  isInline = false,
  embeddedInVariantsOnlySheet = false,
}: Snap2PiecesOptionsLayoutProps) {
  const { activeOptionId, setActiveOptionId, variantPanelOptions, snap2ModulesEmbedInVariantSheet } =
    useOV25UI();
  const [segment, setSegment] = useState<'pieces' | 'options'>('options');

  useEffect(() => {
    if (activeOptionId !== 'modules') return;
    if (snap2ModulesEmbedInVariantSheet) {
      setSegment('pieces');
    }
    const next = variantPanelOptions[0]?.id;
    if (next) setActiveOptionId(next);
  }, [activeOptionId, variantPanelOptions, setActiveOptionId, snap2ModulesEmbedInVariantSheet]);

  const tabBtn = (active: boolean) =>
    `ov25-filter-pill ov25-tabs-button ov:flex ov:flex-1 ov:min-w-0 ov:flex-row ov:items-center ov:justify-center ov:px-5 ov:py-2.5 ov:text-sm ov:font-medium ov:rounded-full ov:border ov:border-(--ov25-border-color) ov:whitespace-nowrap ov:cursor-pointer ov:transition-colors ${
      active
        ? 'ov:bg-(--ov25-background-color) ov:text-(--ov25-text-color)'
        : 'ov:bg-(--ov25-secondary-background-color) ov:text-(--ov25-secondary-text-color) hover:ov:bg-(--ov25-hover-color) hover:ov:text-(--ov25-text-color)'
    }`;

  const hoistVariantsHeader =
    snap2ModulesEmbedInVariantSheet && !embeddedInVariantsOnlySheet && !isInline;

  if (!snap2ModulesEmbedInVariantSheet) {
    return (
      <div
        id="ov25-snap2-options-layout"
        className={`ov:flex ov:flex-col ov:max-h-full ov:h-full ov:min-h-0 ov:bg-(--ov25-background-color) ${isInline ? 'ov:flex-1 ov:overflow-hidden' : ''}`}
      >
        <div className="ov:flex-1 ov:min-h-0 ov:flex ov:flex-col ov:overflow-hidden">
          <ProductVariantsWrapper isInline={isInline} embeddedInVariantsOnlySheet={embeddedInVariantsOnlySheet} />
        </div>
      </div>
    );
  }

  return (
    <div
      id="ov25-snap2-options-layout"
      className={`ov:flex ov:flex-col ov:max-h-full ov:h-full ov:min-h-0 ov:bg-(--ov25-background-color) ${isInline ? 'ov:flex-1 ov:overflow-hidden' : ''}`}
    >
      {hoistVariantsHeader ? <VariantsHeader /> : null}
      <div
        id="ov25-snap2-options-wrapper"
        className="ov:shrink-0 ov:flex ov:w-full ov:max-w-full ov:items-center ov:justify-center ov:gap-2 ov:py-1 ov:md:px-4 ov:md:pt-4 ov:md:pb-3 ov:bg-(--ov25-background-color)"
        role="tablist"
      >
        <button
          type="button"
          role="tab"
          aria-selected={segment === 'pieces'}
          className={tabBtn(segment === 'pieces')}
          onClick={() => setSegment('pieces')}
          data-ov25-snap2-primary-segment-tab="pieces"
          data-selected={segment === 'pieces' ? 'true' : 'false'}
        >
          PIECES
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={segment === 'options'}
          className={tabBtn(segment === 'options')}
          onClick={() => setSegment('options')}
          data-ov25-snap2-primary-segment-tab="options"
          data-selected={segment === 'options' ? 'true' : 'false'}
        >
          FINISH
        </button>
      </div>
      <div className="ov:flex-1 ov:min-h-0 ov:flex ov:flex-col ov:overflow-hidden">
        {segment === 'options' ? (
          <ProductVariantsWrapper
            isInline={isInline}
            embeddedInVariantsOnlySheet={embeddedInVariantsOnlySheet}
            hideVariantsHeader={hoistVariantsHeader}
          />
        ) : (
          <Snap2PiecesPanel
            isInline={isInline}
            embeddedInVariantsOnlySheet={embeddedInVariantsOnlySheet}
            hideVariantsHeader={hoistVariantsHeader}
          />
        )}
      </div>
    </div>
  );
}

export function Snap2Wrapper(props: Snap2WrapperProps) {
  if (props.snap2ModulesOnlySideSheet) {
    return (
      <Snap2VariantSheetColumn>
        <Snap2ModulesOnlySheetInner
          isInline={props.isInline}
          embeddedInVariantsOnlySheet={props.embeddedInVariantsOnlySheet}
        />
      </Snap2VariantSheetColumn>
    );
  }
  return (
    <Snap2VariantSheetColumn>
      <Snap2PiecesOptionsLayout
        isInline={props.isInline}
        embeddedInVariantsOnlySheet={props.embeddedInVariantsOnlySheet}
      />
    </Snap2VariantSheetColumn>
  );
}
