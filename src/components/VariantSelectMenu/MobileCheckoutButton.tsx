import React from 'react';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
import { CheckoutButton } from './CheckoutButton.js';

export const MobileCheckoutButton = () => {
  const { hidePricing, addToBasketFunction, buyNowFunction } = useOV25UI();

  const hasCheckout = typeof addToBasketFunction === 'function' || typeof buyNowFunction === 'function';
  if (hidePricing || !hasCheckout) return null;

  return (
      <CheckoutButton />
  );
};