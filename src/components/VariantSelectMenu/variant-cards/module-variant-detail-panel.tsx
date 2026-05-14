import React, { useMemo } from 'react';
import type { CompatibleModule } from '../../../utils/configurator-utils.js';
import { getModuleProductPreviewImageUrls } from '../../../utils/module-product-image-srcset.js';
import { cn } from '../../../lib/utils.js';
import { useOV25UI } from '../../../contexts/ov25-ui-context.js';

export function dimensionStringFromModule(dimensions: CompatibleModule['dimensions']): string {
  const parts: string[] = [];
  if (dimensions?.x) parts.push(`W ${dimensions.x}cm`);
  if (dimensions?.y) parts.push(`H ${dimensions.y}cm`);
  if (dimensions?.z) parts.push(`D ${dimensions.z}cm`);
  return parts.join(' × ');
}

/** Full product copy + gallery for the module variant detail sheet body. */
export function ModuleVariantDetailPanel({
  module,
  className,
}: {
  module: CompatibleModule;
  className?: string;
}) {
  const { getString } = useOV25UI();
  const moduleProductName = getString('productName', { PRODUCT_NAME: module.product.name }, module.product.name);
  const dimensionString = useMemo(
    () => dimensionStringFromModule(module.dimensions),
    [module.dimensions]
  );
  const dimensionLineResolved = useMemo(() => {
    if (!dimensionString) return '';
    return getString(
      'moduleDetailDimensions',
      {
        DIMENSIONS_LINE: dimensionString,
        PRODUCT_NAME: module.product.name,
        WIDTH_CM: module.dimensions?.x ?? '',
        HEIGHT_CM: module.dimensions?.y ?? '',
        DEPTH_CM: module.dimensions?.z ?? '',
      },
      dimensionString,
    );
  }, [dimensionString, getString, module.dimensions?.x, module.dimensions?.y, module.dimensions?.z, module.product.name]);

  const previewImageUrls = useMemo(
    () => getModuleProductPreviewImageUrls(module.product),
    [
      module.product.cutoutImage,
      module.product.heroImage,
      module.product.images,
      module.product.hasImage,
      module.product.imageUrl,
    ]
  );

  const cutoutUrl = module.product.cutoutImage;

  return (
    <div className={cn('ov25-module-variant-detail-panel ov:space-y-2', className)}>
      <div
        className="ov25-module-variant-detail-panel__header ov:mb-2 ov:flex ov:flex-col ov:items-start ov:gap-1"
        data-ov25-module-variant-detail-part="header"
      >
        <h3
          className="ov25-module-variant-detail-panel__title ov:w-full ov:text-lg ov:font-semibold"
          data-ov25-module-variant-detail-part="title"
        >
          {moduleProductName}
        </h3>
        {dimensionString ? (
          <span
            className="ov25-module-variant-detail-panel__dimensions ov:block ov:w-full ov:text-xs ov:text-gray-500"
            data-ov25-module-variant-detail-part="dimensions"
          >
            {dimensionLineResolved}
          </span>
        ) : null}
      </div>
      {previewImageUrls.length > 0 ? (
        <div
          className="ov25-module-variant-detail-panel__gallery ov:mb-2"
          data-ov25-module-variant-detail-part="gallery"
        >
          {previewImageUrls.length === 1 ? (
            <div
              className='ov25-module-variant-detail-panel__gallery-inner ov25-module-variant-detail-panel__gallery-inner--single ov:relative ov:mx-auto ov:aspect-square ov:w-[calc((100%-0.5rem)/2)] ov:max-w-[calc((100%-0.5rem)/2)] ov:shrink-0 ov:overflow-hidden ov:rounded-lg ov:bg-transparent'
              data-ov25-module-variant-detail-part="gallery-single"
            >
              <img
                src={previewImageUrls[0]}
                alt=""
                className={cn(
                  'ov25-module-variant-detail-panel__gallery-img ov:absolute ov:inset-0 ov:h-full ov:w-full',
                  previewImageUrls[0] === cutoutUrl ? 'ov:object-contain' : 'ov:object-cover'
                )}
              />
            </div>
          ) : (
            <div
              className="ov25-module-variant-detail-panel__gallery-inner ov25-module-variant-detail-panel__gallery-inner--grid ov:grid ov:grid-cols-2 ov:gap-2"
              data-ov25-module-variant-detail-part="gallery-grid"
            >
              {previewImageUrls.map((img, idx) => (
                <div
                  key={`${img}-${idx}`}
                  className='ov25-module-variant-detail-panel__figure ov:relative ov:aspect-square ov:w-full ov:overflow-hidden ov:bg-transparent'
                  data-ov25-module-variant-detail-part="gallery-cell"
                  data-ov25-module-variant-detail-gallery-index={idx}
                >
                  <img
                    src={img}
                    alt=""
                    className={cn(
                      'ov25-module-variant-detail-panel__gallery-img ov:absolute ov:inset-0 ov:h-full ov:w-full',
                      img === cutoutUrl ? 'ov:object-contain' : 'ov:object-cover'
                    )}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
      {(() => {
        const shortD = (module.product.shortDescription ?? '').trim();
        const longD = (module.product.longDescription ?? '').trim();
        const name = module.product.name;
        const shortResolved = shortD
          ? getString(
              'moduleDetailDescriptionShort',
              { DESCRIPTION: shortD, PRODUCT_NAME: name },
              shortD,
            )
          : '';
        const longResolved = longD
          ? getString(
              'moduleDetailDescriptionLong',
              { DESCRIPTION: longD, PRODUCT_NAME: name },
              longD,
            )
          : '';
        if (!shortResolved && !longResolved) return null;
        return (
          <div
            className="ov25-module-variant-detail-panel__descriptions ov:space-y-2"
            data-ov25-module-variant-detail-part="descriptions"
          >
            {shortResolved ? (
              <p
                className="ov25-module-variant-detail-panel__description ov25-module-variant-detail-panel__description-short ov:text-sm ov:text-gray-600 ov:whitespace-pre-wrap"
                data-ov25-module-variant-detail-part="description-short"
              >
                {shortResolved}
              </p>
            ) : null}
            {longResolved ? (
              <p
                className="ov25-module-variant-detail-panel__description ov25-module-variant-detail-panel__description-long ov:text-sm ov:text-gray-600 ov:whitespace-pre-wrap"
                data-ov25-module-variant-detail-part="description-long"
              >
                {longResolved}
              </p>
            ) : null}
          </div>
        );
      })()}
    </div>
  );
}
