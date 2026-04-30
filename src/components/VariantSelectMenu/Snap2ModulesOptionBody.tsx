import React, { useCallback, useEffect, useMemo } from 'react';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
import {
  selectModule,
  snap2SceneContainsModule,
  type CompatibleModule,
} from '../../utils/configurator-utils.js';
import { VariantsContent } from './VariantsContent.js';
import { ModuleVariantCard } from './variant-cards/ModuleVariantCard.js';
import type { Variant, VariantCardProps } from './ProductVariants.js';
import { capitalizeWords, getGridColsClass } from './DesktopVariants.js';
import { ModulePositionTypeTabs } from './ModulePositionTypeTabs.js';
import {
  filterModulesByPositionTab,
  groupModulesByPositionCategory,
} from './module-position-utils.js';
import { Carousel, CarouselContent, CarouselItem } from '../ui/carousel.js';
import { Snap2ModulesEmptyState } from './Snap2ModulesEmptyState.js';

function modulesToVariants(modules: CompatibleModule[], snap2Objects: unknown[] | undefined): Variant[] {
  return modules.map(
    (module) =>
      ({
        id: `${module.productId}-${module.model.modelId}`,
        name: module.product.name,
        price: 0,
        image: module.product.hasImage ? module.product.imageUrl : '/placeholder.svg?height=200&width=200',
        blurHash: '',
        data: module,
        isSelected: snap2SceneContainsModule(snap2Objects, module.productId, module.model.modelId),
      }) as Variant
  );
}

export function Snap2ModulesOptionBody() {
  const {
    compatibleModules,
    isModuleSelectionLoading,
    setIsModuleSelectionLoading,
    configuratorState,
    isMobile,
    selectedModuleType,
    setSelectedModuleType,
  } = useOV25UI();

  const hasSnap2Objects = (configuratorState?.snap2Objects?.length ?? 0) > 0;

  useEffect(() => {
    if (compatibleModules && compatibleModules.length > 0) {
      setSelectedModuleType('all');
    }
  }, [compatibleModules, setSelectedModuleType]);

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

  const ModuleVariantCardWithLoading = useCallback(
    (props: VariantCardProps) => <ModuleVariantCard {...props} isLoading={isModuleSelectionLoading} className="ov:px-0" />,
    [isModuleSelectionLoading]
  );

  const filteredModules = useMemo(() => {
    const list = compatibleModules ?? [];
    if (list.length === 0) return [];
    return filterModulesByPositionTab(list, selectedModuleType);
  }, [compatibleModules, selectedModuleType]);

  const positionGroups = useMemo(
    () => groupModulesByPositionCategory(filteredModules),
    [filteredModules]
  );

  const gridDivide = 1;
  const showGroupHeaders = positionGroups.length > 1;

  if (!hasSnap2Objects) {
    return (
      <div
        className="ov:flex ov:flex-col ov:items-center ov:justify-center ov:py-8 ov:space-y-4"
        id="ov25-snap2-modules-body"
        data-loading="true"
        data-ov25-snap2-modules-state="loading"
      >
        <p className="ov:text-sm ov:text-(--ov25-secondary-text-color)">Loading...</p>
      </div>
    );
  }

  if (compatibleModules === null) {
    return (
      <div
        className="ov:flex ov:flex-col ov:items-center ov:justify-center ov:py-8 ov:space-y-4"
        id="ov25-snap2-modules-body"
        data-loading="true"
        data-ov25-snap2-modules-state="loading"
      >
        <p className="ov:text-sm ov:text-(--ov25-secondary-text-color)">Loading...</p>
      </div>
    );
  }

  if (compatibleModules.length === 0) {
    return <Snap2ModulesEmptyState id="ov25-snap2-modules-body" stateAttr="empty" />;
  }

  if (isMobile) {
    const mobileVariants = modulesToVariants(filteredModules, configuratorState?.snap2Objects);
    return (
      <div
        className="ov:flex ov:flex-col ov:min-h-0"
        id="ov25-snap2-modules-body"
        data-ov25-snap2-modules-state="ready"
      >
        <div
          id="ov25-snap2-modules-tabs-wrap"
          className="ov:shrink-0 ov:sticky ov:top-0 ov:z-10 ov:bg-(--ov25-background-color) ov:py-1 ov:px-0"
        >
          <ModulePositionTypeTabs embed="variantSheet" />
        </div>
        <div className="ov:flex ov:min-h-0 ov:flex-1 ov:flex-col ov:overflow-hidden ov:px-2 ov:pb-0 ov:md:pb-4">
          <Carousel
            className="ov:w-full ov:min-h-0 ov:flex-1 ov:min-w-0"
            opts={{ align: 'start', containScroll: 'trimSnaps' }}
          >
            <CarouselContent className="ov:-ml-2 ov:min-h-0">
              {mobileVariants.map((variant, index) => (
                <CarouselItem
                  key={variant.id}
                  className="ov:border-0! ov:basis-[min(74vw,22rem)] ov:shrink-0 ov:pl-2"
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
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    );
  }

  return (
    <div
      className="ov:flex ov:flex-col ov:min-h-0"
      id="ov25-snap2-modules-body"
      data-ov25-snap2-modules-state="ready"
    >
      <div
        id="ov25-snap2-modules-tabs-wrap"
        className="ov:shrink-0 ov:sticky ov:top-0 ov:z-10 ov:bg-(--ov25-background-color) ov:py-1 ov:md:pt-3 ov:md:pb-2 ov:px-0 ov:md:px-4"
      >
        <ModulePositionTypeTabs embed="variantSheet" />
      </div>
      <div className="ov:flex-1 ov:min-h-0 ov:md:px-4 ov:pb-6">
        {positionGroups.map(({ label, modules }) => (
          <div
            key={label}
            className="ov25-snap2-modules-position-group ov:mb-4 last:ov:mb-0"
            data-ov25-snap2-modules-position-group={label.replace(/\s+/g, '-').toLowerCase()}
          >
            {showGroupHeaders && (
              <h4
                className={`ov25-group-header ov:sticky ov:z-9 ov:bg-(--ov25-background-color) ov:px-0 ov:text-sm ov:pt-4 ov:pb-3 ov:text-(--ov25-secondary-text-color) ov:font-medium ov:top-0`}
              >
                {capitalizeWords(label)}
              </h4>
            )}
            <div className="ov25-variant-group-content ov:bg-(--ov25-background-color) ov:pt-2">
              <div
                className={`ov25-snap2-modules-grid ov:grid ${getGridColsClass(gridDivide)}`}
                data-loading={isModuleSelectionLoading ? 'true' : 'false'}
              >
                <VariantsContent
                  variantsToRender={modulesToVariants(modules, configuratorState?.snap2Objects)}
                  VariantCard={ModuleVariantCardWithLoading}
                  isMobile={isMobile}
                  onSelect={handleModuleSelect}
                  compactSpacing
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
