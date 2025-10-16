import React  from 'react';
import { ProductVariants, Variant } from './ProductVariants.js';
import { useOV25UI } from "../../contexts/ov25-ui-context.js";
import { selectModule, CompatibleModule, closeModuleSelectMenu } from '../../utils/configurator-utils.js';
import { SizeVariantCard } from "./variant-cards/SizeVariantCard.js";
import { LegsVariantCard } from "./variant-cards/LegsVariantCard.js";
import { ModuleVariantCard } from "./variant-cards/ModuleVariantCard.js";
import { ModuleTypeTabs } from './ModuleTypeTabs.js';
import { Loader2 } from 'lucide-react';

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
        isSnap2Mode,
        isModuleSelectionLoading,
        setIsModuleSelectionLoading,
        selectedModuleType,
        setSelectedModuleType,
        configuratorState,
      } = useOV25UI();

    const handleModuleSelect = (variant: Variant) => {
      if (isModuleSelectionLoading) {
        return;
      }
      
      const module = variant.data as CompatibleModule;
      const modelPath = module?.model?.modelPath;
      const modelId = module?.model?.modelId;
      
      if (!modelPath || !modelId) {
        return;
      }
      
      setIsModuleSelectionLoading(true);
      selectModule(modelPath, modelId);
    };

    const handleCloseVariants = () => {
      // If we're closing the modules option, send message to iframe
      if (activeOptionId === 'modules') {
        closeModuleSelectMenu();
      }
      setIsVariantsOpen(false);
    };

    // Check if we should show module selection (Snap2 mode)
    if (isSnap2Mode && activeOptionId === 'modules') {
      const filteredModules = compatibleModules && compatibleModules.length > 0 ? 
        compatibleModules.filter(module => {
          if (selectedModuleType === 'all') return true;
          const position = module.position.toLowerCase();
          return position.includes(selectedModuleType);
        }) : [];

      const shouldShowLoading = (!compatibleModules || compatibleModules.length === 0) && 
                                (!configuratorState?.snap2Objects || configuratorState.snap2Objects.length === 0);

      if (shouldShowLoading) {
        return (
          <div className="ov:flex ov:flex-col ov:items-center ov:justify-center ov:py-8 ov:space-y-4">
            <Loader2 className="ov:w-8 ov:h-8 ov:animate-spin ov:text-[var(--ov25-text-color)]" />
            <p className="ov:text-sm ov:text-[var(--ov25-secondary-text-color)]">
              Loading...
            </p>
          </div>
        );
      }

      return (
        <ProductVariants
          isOpen={isVariantsOpen}
          gridDivide={2}
          onClose={handleCloseVariants}
          title="Modules"
          variants={filteredModules.map(module => ({
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
          moduleTypeTabs={
            <ModuleTypeTabs 
              selectedType={selectedModuleType}
              onTypeChange={setSelectedModuleType}
              compatibleModules={compatibleModules}
            />
          }
        />
      );
    }

    if (activeOptionId === 'size') {
      return (
        <ProductVariants
          isOpen={isVariantsOpen}
          gridDivide={2}
          onClose={handleCloseVariants}
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
          isMobile={isMobile}
        />
      );
    } else if (typeof activeOptionId === 'string') {
      // Check if the option name includes "leg" (case insensitive)
      const isLegOption = activeOption?.name?.toLowerCase().includes('leg');
      
      // Handle all non-size options the same way, but use LegsVariantCard when appropriate
      return (
        <ProductVariants
          isOpen={isVariantsOpen}
          basis={isMobile ? 'ov:basis-[33%]' : undefined}
          gridDivide={isLegOption ? 2 : (isMobile ? 4 : 4)}
          onClose={handleCloseVariants}
          title={`${activeOption?.name || ''}`}
          variants={activeOption?.groups?.map(group => ({
            groupName: group?.name,
            variants: group?.selections?.map(selection => ({
              id: selection?.id,
              groupId: group?.id,
              optionId: activeOption?.id,
              name: selection?.name,
              price: selection?.price,
              image: (isLegOption ? selection?.miniThumbnails?.large : selection?.miniThumbnails?.medium) || '/placeholder.svg?height=200&width=200',
              blurHash: (selection as any).blurHash,
              isSelected: selectedSelections.some(
                sel => sel.optionId === activeOption.id && 
                      sel.groupId === group.id && 
                      sel.selectionId === selection.id
              ),
              swatch: selection?.swatch
            })).sort((a, b) => a.name.localeCompare(b.name))
          })) || []}
          VariantCard={isLegOption ? LegsVariantCard : undefined}
          drawerSize={drawerSize}
          onSelect={handleSelectionSelect}
          isMobile={isMobile}
        />
      );
    }
    return null;
  }