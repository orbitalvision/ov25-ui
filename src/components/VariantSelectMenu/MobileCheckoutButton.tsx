import React from 'react';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
import { CheckoutButton } from './CheckoutButton.js';

export const MobileCheckoutButton = () => {
  const { hidePricing, disableAddToCart, addToBasketFunction, buyNowFunction } = useOV25UI();

  const hasAddToBasket = typeof addToBasketFunction === 'function' && !disableAddToCart;
  const hasBuyNow = typeof buyNowFunction === 'function';
  const hasCheckout = hasAddToBasket || hasBuyNow;
  if (hidePricing || !hasCheckout) return null;

  return (
      <CheckoutButton />
  );
};