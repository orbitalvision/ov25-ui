import type {
  CommerceLineItemPrice,
  CommerceLineItemSku,
  OptionSkuMap,
  UnifiedPricePayload,
  UnifiedSkuPayload,
  UnifiedSkuPayloadMulti,
  UnifiedSkuPayloadSingle,
} from '../types/inject-config.js';

/** Parses iframe `payload` when it is JSON string or already an object. */
export function parseIframeJsonPayload(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data) as unknown;
    } catch {
      return null;
    }
  }
  return data;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isLineSkuEntry(v: unknown): v is { skuString: string; skuMap?: Record<string, string>; quantity?: number } {
  if (!isPlainObject(v)) return false;
  return typeof v.skuString === 'string';
}

function isMultiSkuRecord(obj: Record<string, unknown>): boolean {
  if (typeof obj.skuString === 'string') return false;
  const keys = Object.keys(obj);
  if (keys.length === 0) return false;
  return keys.every(k => isLineSkuEntry(obj[k]));
}

function singleProductLineId(skuMap?: OptionSkuMap): string {
  if (!skuMap) return 'single';
  const p = skuMap.Products ?? skuMap.Product;
  if (typeof p === 'string' && p) return p;
  const first = Object.values(skuMap).find(v => typeof v === 'string' && v);
  return typeof first === 'string' ? first : 'single';
}

/**
 * Maps raw CURRENT_SKU JSON from the iframe into a discriminated unified shape
 * (`mode` + `lines`, plus legacy top-level fields for single-product).
 */
export function normalizeSkuPayload(data: unknown): UnifiedSkuPayload | null {
  const raw = parseIframeJsonPayload(data);
  if (!isPlainObject(raw)) return null;

  if (isMultiSkuRecord(raw)) {
    const lines: CommerceLineItemSku[] = Object.entries(raw).map(([id, v]) => {
      const entry = v as { skuString: string; skuMap?: Record<string, string>; quantity?: number };
      return {
        id,
        skuString: entry.skuString,
        skuMap: entry.skuMap ?? {},
        quantity: typeof entry.quantity === 'number' && entry.quantity > 0 ? entry.quantity : 1,
      };
    });

    const out: UnifiedSkuPayloadMulti = { mode: 'multi', lines };
    return out;
  }

  const skuString = typeof raw.skuString === 'string' ? raw.skuString : '';
  const skuMap = isPlainObject(raw.skuMap) ? (raw.skuMap as OptionSkuMap) : undefined;

  const lines: CommerceLineItemSku[] = [
    {
      id: singleProductLineId(skuMap),
      skuString,
      skuMap: skuMap ?? {},
      quantity: 1,
    },
  ];

  const out: UnifiedSkuPayloadSingle = {
    mode: 'single',
    lines,
    skuString,
    ...(skuMap !== undefined ? { skuMap } : {}),
  };
  return out;
}

function mapPriceBreakdownToSelections(rows: unknown[]): CommerceLineItemPrice['selections'] {
  return rows
    .filter(isPlainObject)
    .map(row => {
      const category = typeof row.category === 'string' ? row.category : undefined;
      const name = typeof row.name === 'string' ? row.name : '';
      const sku = typeof row.sku === 'string' ? row.sku : undefined;
      const price = typeof row.price === 'number' ? row.price : 0;
      const formattedPrice = typeof row.formattedPrice === 'string' ? row.formattedPrice : '';
      return { category, name, sku, price, formattedPrice };
    });
}

function mapProductBreakdownSelections(rows: unknown): CommerceLineItemPrice['selections'] {
  if (!Array.isArray(rows)) return [];
  return rows
    .filter(isPlainObject)
    .map(sel => {
      const name = typeof sel.name === 'string' ? sel.name : '';
      const category = typeof sel.category === 'string' ? sel.category : undefined;
      const sku = typeof sel.sku === 'string' ? sel.sku : undefined;
      const price = typeof sel.price === 'number' ? sel.price : 0;
      const formattedPrice = typeof sel.formattedPrice === 'string' ? sel.formattedPrice : '';
      const thumbnail = typeof sel.thumbnail === 'string' ? sel.thumbnail : undefined;
      return { category, name, sku, price, formattedPrice, thumbnail };
    });
}

function readDiscount(raw: Record<string, unknown>): UnifiedPricePayload['discount'] {
  const d = raw.discount;
  if (!isPlainObject(d)) {
    return { percentage: 0, amount: 0, formattedAmount: '' };
  }
  return {
    percentage: typeof d.percentage === 'number' ? d.percentage : 0,
    amount: typeof d.amount === 'number' ? d.amount : 0,
    formattedAmount: typeof d.formattedAmount === 'string' ? d.formattedAmount : '',
  };
}

/**
 * Maps raw CURRENT_PRICE JSON from the iframe into a unified shape with `mode`, `lines`,
 * order-level totals, and optional passthrough of legacy breakdown arrays.
 */
export function normalizePricePayload(data: unknown): UnifiedPricePayload | null {
  const raw = parseIframeJsonPayload(data);
  if (!isPlainObject(raw)) return null;

  const totalPrice = typeof raw.totalPrice === 'number' ? raw.totalPrice : 0;
  const subtotal = typeof raw.subtotal === 'number' ? raw.subtotal : 0;
  const formattedPrice = typeof raw.formattedPrice === 'string' ? raw.formattedPrice : '';
  const formattedSubtotal = typeof raw.formattedSubtotal === 'string' ? raw.formattedSubtotal : '';
  const discount = readDiscount(raw);

  const productBreakdownsRaw = raw.productBreakdowns;
  const priceBreakdownRaw = raw.priceBreakdown;

  const lines: CommerceLineItemPrice[] = [];

  if (Array.isArray(productBreakdownsRaw) && productBreakdownsRaw.length > 0) {
    for (const row of productBreakdownsRaw) {
      if (!isPlainObject(row)) continue;
      const id =
        typeof row.productId === 'string'
          ? row.productId
          : typeof row.modelId === 'string'
            ? row.modelId
            : '';
      const name = typeof row.name === 'string' ? row.name : '';
      const quantity = typeof row.quantity === 'number' && row.quantity > 0 ? row.quantity : 1;
      const price = typeof row.price === 'number' ? row.price : 0;
      const formattedPriceRow = typeof row.formattedPrice === 'string' ? row.formattedPrice : '';
      const subtotalRow = typeof row.subtotal === 'number' ? row.subtotal : 0;
      const formattedSubtotalRow =
        typeof row.formattedSubtotal === 'string' ? row.formattedSubtotal : '';
      const discountedAmount = typeof row.discountedAmount === 'number' ? row.discountedAmount : 0;
      const formattedDiscountAmount =
        typeof row.formattedDiscountAmount === 'string' ? row.formattedDiscountAmount : '';
      const discountPercentage = typeof row.discountPercentage === 'number' ? row.discountPercentage : 0;
      const modelId = typeof row.modelId === 'string' ? row.modelId : undefined;

      lines.push({
        id: id || name || `line-${lines.length}`,
        name,
        quantity,
        price,
        formattedPrice: formattedPriceRow,
        subtotal: subtotalRow,
        formattedSubtotal: formattedSubtotalRow,
        discountedAmount,
        formattedDiscountAmount,
        discountPercentage,
        selections: mapProductBreakdownSelections(row.selections),
        ...(modelId ? { modelId } : {}),
      });
    }

    const out: UnifiedPricePayload = {
      mode: 'multi',
      totalPrice,
      subtotal,
      formattedPrice,
      formattedSubtotal,
      discount,
      lines,
    };
    out.productBreakdowns = productBreakdownsRaw;
    return out;
  }

  if (Array.isArray(priceBreakdownRaw) && priceBreakdownRaw.length > 0) {
    const productRow = priceBreakdownRaw.find(
      (r): r is Record<string, unknown> => isPlainObject(r) && r.category === 'Products'
    );
    const id =
      productRow && typeof productRow.sku === 'string' && productRow.sku
        ? productRow.sku
        : typeof productRow?.name === 'string' && productRow.name
          ? String(productRow.name)
          : 'single';

    const name =
      productRow && typeof productRow.name === 'string' ? productRow.name : '';

    lines.push({
      id,
      name,
      quantity: 1,
      price: totalPrice,
      formattedPrice,
      subtotal,
      formattedSubtotal,
      discountedAmount: discount.amount,
      formattedDiscountAmount: discount.formattedAmount,
      discountPercentage: discount.percentage,
      selections: mapPriceBreakdownToSelections(priceBreakdownRaw),
    });

    const out: UnifiedPricePayload = {
      mode: 'single',
      totalPrice,
      subtotal,
      formattedPrice,
      formattedSubtotal,
      discount,
      lines,
      priceBreakdown: priceBreakdownRaw,
    };
    return out;
  }

  const out: UnifiedPricePayload = {
    mode: 'single',
    totalPrice,
    subtotal,
    formattedPrice,
    formattedSubtotal,
    discount,
    lines: [
      {
        id: 'single',
        name: '',
        quantity: 1,
        price: totalPrice,
        formattedPrice,
        subtotal,
        formattedSubtotal,
        discountedAmount: discount.amount,
        formattedDiscountAmount: discount.formattedAmount,
        discountPercentage: discount.percentage,
        selections: [],
      },
    ],
  };
  return out;
}
