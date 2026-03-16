import React from 'react';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
import { CheckoutButton } from './CheckoutButton.js';

export const MobileCheckoutButton = () => {
  const { hidePricing, addToBasketFunction, buyNowFunction } = useOV25UI();

  const hasCheckout = typeof addToBasketFunction === 'function' || typeof buyNowFunction === 'function';
  if (hidePricing || !hasCheckout) return null;

  return (
    <div className="ov:shrink-0 ov:px-4 ov:pb-2 ov:pt-2">
      <CheckoutButton />
    </div>
  );
};