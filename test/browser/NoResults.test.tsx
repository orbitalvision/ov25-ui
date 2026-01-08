import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import React from 'react'
import { NoResults } from '../../src/components/VariantSelectMenu/NoResults'
import { OV25UIProvider } from '../../src/contexts/ov25-ui-context'

// Mock provider props - minimal required props for testing
const mockProviderProps = {
  productLink: null,
  apiKey: 'test-api-key',
  configurationUuid: 'test-uuid',
  buyNowFunction: () => {},
  addToBasketFunction: () => {},
  addSwatchesToCartFunction: () => {},
  isProductGalleryStacked: false,
  hasConfigureButton: false,
}

test('renders custom message when message prop provided', async () => {
  const customMessage = 'Custom no results message'
  const { getByText } = await render(
    <OV25UIProvider {...mockProviderProps}>
      <NoResults message={customMessage} />
    </OV25UIProvider>
  )
  
  await expect.element(getByText(customMessage)).toBeInTheDocument()
})

test('renders default message when no message prop provided', async () => {
  const { container } = await render(
    <OV25UIProvider {...mockProviderProps}>
      <NoResults />
    </OV25UIProvider>
  )
  
  // Component will render either "No results found" or modules message based on context
  const noResultsDiv = container.querySelector('#ov25-no-results') as HTMLElement | null
  await expect.element(noResultsDiv).toBeInTheDocument()
  
  const heading = noResultsDiv && (noResultsDiv.querySelector('h3') as HTMLElement | null)
  await expect.element(heading).toBeInTheDocument()
  // Should contain some text (either default or context-based message)
  await expect.element(heading).toHaveTextContent(/.+/)
})

test('has correct structure and ID', async () => {
  const { container } = await render(
    <OV25UIProvider {...mockProviderProps}>
      <NoResults message="Test message" />
    </OV25UIProvider>
  )
  
  const noResultsDiv = container.querySelector('#ov25-no-results') as HTMLElement | null
  await expect.element(noResultsDiv).toBeInTheDocument()
  await expect.element(noResultsDiv).toHaveAttribute('id', 'ov25-no-results')
  
  const heading = container.querySelector('h3')
  await expect.element(heading).toBeInTheDocument()
  await expect.element(heading).toHaveTextContent('Test message')
})

test('renders with correct container structure', async () => {
  const { container } = await render(
    <OV25UIProvider {...mockProviderProps}>
      <NoResults message="Test" />
    </OV25UIProvider>
  )
  
  // Check that the component renders the expected DOM structure
  const wrapper = container.querySelector('#ov25-no-results') as HTMLElement | null
  await expect.element(wrapper).toBeInTheDocument()
  
  // Should have an h3 child
  const heading = wrapper && (wrapper.querySelector('h3') as HTMLElement | null)
  await expect.element(heading).toBeInTheDocument()
})
