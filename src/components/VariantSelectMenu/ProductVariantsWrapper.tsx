import React, { useMemo, useCallback } from 'react';
import { ProductVariants, Variant } from './ProductVariants.js';
import { useOV25UI } from "../../contexts/ov25-ui-context.js";
import { closeModuleSelectMenu, selectModule, CompatibleModule } from '../../utils/configurator-utils.js';
import { SizeVariantCard } from "./variant-cards/SizeVariantCard.js";
import { ModuleVariantCard } from "./variant-cards/ModuleVariantCard.js";

export type DrawerSizes = 'closed' | 'small' | 'large';

export function ProductVariantsWrapper() {
    const {
        isVariantsOpen,
        setIsVariantsOpen,
        isMobile,
        drawerSize,
        activeOptionId,
        activeOption,
        sizeOption,
        handleSelectionSelect,
        currentProductId,
        selectedSelections,
        products,
        compatibleModules,
        isModuleSelectionLoading,
        setIsModuleSelectionLoading,
        configuratorState,
        allOptionsWithoutModules,
        applySearchAndFilters,
        searchQueries,
        availableProductFilters,
      } = useOV25UI();

    const handleCloseVariants = () => {
      // If we're closing the modules option, send message to iframe
      if (activeOptionId === 'modules') {
        closeModuleSelectMenu();
      }
      setIsVariantsOpen(false);
    };

    // Wrapper to convert Variant to Selection format for handleSelectionSelect
    // Memoized to ensure stable reference
    const handleVariantSelect = useCallback((variant: Variant) => {
      // Convert Variant to Selection-like object
      const selection = {
        id: variant.id,
        name: variant.name,
        price: variant.price,
        blurHash: variant.blurHash || '',
        groupId: variant.groupId,
        thumbnail: variant.image,
        miniThumbnails: variant.image ? { medium: variant.image } : undefined,
      };
      handleSelectionSelect(selection as any, variant.optionId);
    }, [handleSelectionSelect]);

    // Apply filters and search to all options (memoized to recalculate when filters/search change)
    const filteredOptions = useMemo(() => {
      return allOptionsWithoutModules.map(option => {
        if (option.id === 'size') return option; // Size doesn't need filtering
        return applySearchAndFilters(option, option.id);
      });
    }, [allOptionsWithoutModules, applySearchAndFilters, searchQueries, availableProductFilters]);

    // Memoize size variants to recalculate when selectedSelections changes
    const sizeVariants = useMemo(() => {
      if (!sizeOption?.groups?.[0]?.selections) return [];
      return sizeOption.groups[0].selections.map(selection => ({
        id: selection?.id,
        optionId: 'size', // Required for handleVariantSelect to work
        name: selection?.name,
        price: selection?.price,
        image: selection?.thumbnail || '/placeholder.svg?height=200&width=200',
        blurHash: (selection as any)?.blurHash,
        data: products?.find(p => p?.id === selection?.id),
        isSelected: selection.id === currentProductId || selectedSelections.some(
          sel => sel.optionId === 'size' && sel.selectionId === selection.id
        )
      }));
    }, [sizeOption, currentProductId, selectedSelections, products]);

    // Memoize variants for all other options to recalculate when selectedSelections changes
    const allOptionsVariants = useMemo(() => {
      return filteredOptions
        .map((filteredOption, index) => {
          const option = allOptionsWithoutModules[index];
          if (option.id === 'size') return null; // Size is handled separately
          
          return {
            optionId: option.id,
            optionName: option.name,
            variants: filteredOption.groups
              ?.filter(group => 'name' in group && group.name) // Only include groups with names
              ?.map(group => ({
                groupName: 'name' in group ? group.name : 'Default Group',
                variants: group?.selections?.map(selection => ({
                  id: selection?.id,
                  groupId: group?.id,
                  optionId: option.id,
                  name: selection?.name,
                  price: selection?.price,
                  image: (selection as any)?.miniThumbnails?.medium || '/placeholder.svg?height=200&width=200',
                  blurHash: (selection as any).blurHash,
                  isSelected: selectedSelections.some(
                    sel => sel.optionId === option.id && 
                          sel.groupId === group.id && 
                          sel.selectionId === selection.id
                  ),
                  swatch: (selection as any)?.swatch
                })).sort((a, b) => a.name.localeCompare(b.name))
              })) || []
          };
        })
        .filter((item): item is { optionId: string; optionName: string; variants: any[] } => item !== null);
    }, [filteredOptions, allOptionsWithoutModules, selectedSelections]);

    // Mobile/tablet: show modules list in the drawer when modules option is active
    if (window.innerWidth < 1024 && activeOptionId === 'modules') {
      const isLoading = (!compatibleModules || compatibleModules.length === 0) && 
        (!configuratorState?.snap2Objects || configuratorState.snap2Objects.length === 0);

      const handleModuleSelect = (variant: Variant) => {
        if (isModuleSelectionLoading) return;
        const module = variant.data as CompatibleModule;
        const modelPath = module?.model?.modelPath;
        const modelId = module?.model?.modelId;
        if (!modelPath || !modelId) return;
        setIsModuleSelectionLoading(true);
        selectModule(modelPath, modelId);
      };

      if (isLoading) {
        return (
          <div className="ov:flex ov:flex-col ov:items-center ov:justify-center ov:py-8 ov:space-y-4">
            <p className="ov:text-sm ov:text-[var(--ov25-secondary-text-color)]">Loading...</p>
          </div>
        );
      }

      return (
        <ProductVariants
          isOpen={isVariantsOpen}
          gridDivide={2}
          onClose={handleCloseVariants}
          title="Modules"
          variants={(compatibleModules || []).map(module => ({
            id: `${module.productId}-${module.model.modelId}`,
            name: module.product.name,
            price: 0,
            image: module.product.hasImage ? module.product.imageUrl : '/placeholder.svg?height=200&width=200',
            blurHash: '',
            data: module,
            isSelected: false
          } as Variant))}
          VariantCard={(props) => (
            <ModuleVariantCard 
              {...props} 
              isLoading={isModuleSelectionLoading}
            />
          )}
          drawerSize={drawerSize}
          onSelect={handleModuleSelect}
          isMobile={isMobile}
        />
      );
    }

    // Render all options, hiding inactive ones with display: none
    // This keeps components mounted, preventing image reloads when switching options
    // Wrap in a container with height constraints so only the visible one affects layout
    return (
      <div className="ov:md:flex ov:md:flex-col ov:max-h-full ov:h-full ov:relative">
        {/* Size option */}
        {sizeVariants.length > 0 && (
          <div 
            className="ov:absolute ov:inset-0"
            style={{ display: activeOptionId === 'size' ? 'block' : 'none' }}
          >
            <ProductVariants
              isOpen={isVariantsOpen}
              gridDivide={2}
              onClose={handleCloseVariants}
              title="Size"
              variants={sizeVariants}
              VariantCard={SizeVariantCard}
              drawerSize={drawerSize}
              onSelect={handleVariantSelect}
              isMobile={isMobile}
            />
          </div>
        )}
        
        {/* All other options - using memoized variants */}
        {allOptionsVariants.map(({ optionId, optionName, variants }) => (
          <div 
            key={optionId}
            className="ov:absolute ov:inset-0"
            style={{ display: activeOptionId === optionId ? 'block' : 'none' }}
          >
            <ProductVariants
              isOpen={isVariantsOpen}
              basis={isMobile ? 'ov:basis-[33%]' : undefined}
              gridDivide={4}
              onClose={handleCloseVariants}
              title={optionName}
              variants={variants}
              VariantCard={undefined}
              drawerSize={drawerSize}
              onSelect={handleVariantSelect}
              isMobile={isMobile}
            />
          </div>
        ))}
      </div>
    )
  }