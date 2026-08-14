import React from 'react';

export const SELECTION_DETAILS_DESKTOP_MODES = [
  'none',
  'tooltip',
  'sheet',
  'modal',
  'fullscreen',
];

export const SELECTION_DETAILS_MOBILE_MODES = [
  'none',
  'modal',
  'fullscreen',
];

export const VARIANT_STYLES = ['tree', 'list', 'tabs', 'accordion', 'wizard'];
export const CONFIGURATOR_MODES = ['sheet', 'modal', 'inline'];

const CONFIGURATOR_DISPLAY_MODES = {
  sheet: { desktop: 'sheet', mobile: 'drawer' },
  modal: { desktop: 'modal', mobile: 'modal' },
  inline: { desktop: 'inline', mobile: 'inline' },
};

function readChoice(query, key, allowed, fallback) {
  const value = query.get(key);
  return value && allowed.includes(value) ? value : fallback;
}

function readMobileDetailsChoice(query, fallback) {
  const value = query.get('mobileDetails');
  if (value === 'sheet' || value === 'tooltip') return 'fullscreen';
  return value && SELECTION_DETAILS_MOBILE_MODES.includes(value) ? value : fallback;
}

function currentQuery() {
  return typeof window === 'undefined'
    ? new URLSearchParams()
    : new URLSearchParams(window.location.search);
}

function mobileDetailsFallback(desktop) {
  if (desktop === 'none') return 'none';
  if (desktop === 'modal') return 'modal';
  return 'fullscreen';
}

function readSelectionDetailsModeChoice(query, defaults) {
  return {
    desktopDetails: readChoice(
      query,
      'desktopDetails',
      SELECTION_DETAILS_DESKTOP_MODES,
      defaults.desktopDetails,
    ),
    mobileDetails: readMobileDetailsChoice(query, defaults.mobileDetails),
  };
}

export function readSelectionDetailsModeQuery(defaults) {
  return readSelectionDetailsModeChoice(currentQuery(), defaults);
}

/**
 * Adds selection details to an existing fixture only when at least one detail
 * query parameter is supplied. This keeps each fixture's legacy default exact.
 */
export function readOptionalSelectionDetailsQuery() {
  const query = currentQuery();
  if (!query.has('desktopDetails') && !query.has('mobileDetails')) return null;

  const desktop = readChoice(
    query,
    'desktopDetails',
    SELECTION_DETAILS_DESKTOP_MODES,
    'none',
  );
  const inheritedMobile = mobileDetailsFallback(desktop);
  const mobile = readMobileDetailsChoice(query, inheritedMobile);

  return { displayMode: { desktop, mobile } };
}

export function readSelectionDetailsFixtureQuery(defaults) {
  const query = currentQuery();
  const { desktopDetails, mobileDetails } = readSelectionDetailsModeChoice(
    query,
    defaults,
  );
  const variantStyle = readChoice(
    query,
    'variantStyle',
    VARIANT_STYLES,
    defaults.variantStyle,
  );
  const configuratorMode = readChoice(
    query,
    'configuratorMode',
    CONFIGURATOR_MODES,
    defaults.configuratorMode,
  );

  return {
    desktopDetails,
    mobileDetails,
    variantStyle,
    configuratorMode,
    configuratorDisplayMode: CONFIGURATOR_DISPLAY_MODES[configuratorMode],
  };
}

function QuerySelect({ label, queryKey, value, options }) {
  const update = (event) => {
    const url = new URL(window.location.href);
    url.searchParams.set(queryKey, event.target.value);
    window.location.assign(url.href);
  };

  return (
    <label className="ov:flex ov:flex-col ov:gap-1 ov:text-xs ov:font-medium ov:text-[#525252]">
      <span>{label}</span>
      <select
        data-ov25-fixture-control={queryKey}
        value={value}
        onChange={update}
        className="ov:min-w-32 ov:rounded-md ov:border ov:border-gray-300 ov:bg-white ov:px-2 ov:py-1.5 ov:text-sm ov:text-[#1a1a1a]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function SelectionDetailsModeFields({ values }) {
  return (
    <>
      <QuerySelect
        label="Desktop details"
        queryKey="desktopDetails"
        value={values.desktopDetails}
        options={SELECTION_DETAILS_DESKTOP_MODES}
      />
      <QuerySelect
        label="Mobile details"
        queryKey="mobileDetails"
        value={values.mobileDetails}
        options={SELECTION_DETAILS_MOBILE_MODES}
      />
    </>
  );
}

export function SelectionDetailsModeControls({ values }) {
  return (
    <div
      data-ov25-selection-details-mode-controls
      className="ov:flex ov:flex-wrap ov:gap-3 ov:rounded-lg ov:border ov:border-gray-200 ov:bg-gray-50 ov:p-3"
    >
      <SelectionDetailsModeFields values={values} />
    </div>
  );
}

export function SelectionDetailsControls({ values }) {
  return (
    <div
      data-ov25-selection-details-fixture-controls
      className="ov:mb-4 ov:flex ov:flex-wrap ov:gap-3 ov:rounded-lg ov:border ov:border-gray-200 ov:bg-gray-50 ov:p-3"
    >
      <SelectionDetailsModeFields values={values} />
      <QuerySelect
        label="Variant style"
        queryKey="variantStyle"
        value={values.variantStyle}
        options={VARIANT_STYLES}
      />
      <QuerySelect
        label="Configurator mode"
        queryKey="configuratorMode"
        value={values.configuratorMode}
        options={CONFIGURATOR_MODES}
      />
    </div>
  );
}
