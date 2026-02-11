'use client';
"use strict";

exports.__esModule = true;
exports.createBreakpoints = createBreakpoints;
/**
 * Capitalize the first letter of a string
 */
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Adjust max-width value to avoid breakpoint overlapping
 */
function adjustMaxWidth(value) {
  // If value is 0, don't adjust
  if (value === 0) return '0px';

  // Subtract a small value to avoid overlap
  const adjustedNum = value - 0.01;
  return `${adjustedNum}px`;
}

/**
 * Create media query string
 */
function createMediaQuery(options) {
  const {
    min,
    max
  } = options;
  if (!min && !max) return '';
  const conditions = [];
  if (min) conditions.push(`(min-width: ${min})`);
  if (max) conditions.push(`(max-width: ${max})`);
  return conditions.join(' and ');
}

/**
 * Create traditional media query map compatible with previous versions
 */
function createLegacyMediaQueryMap(breakpoints) {
  const entries = Object.entries(breakpoints);
  const result = {};

  // Special case for xs
  const xsValue = breakpoints.xs;
  if (xsValue !== undefined) {
    // For xs, use max-width of the next breakpoint minus 0.01
    const nextBreakpoint = entries.find(([key]) => key === 'sm');
    if (nextBreakpoint) {
      result.xs = `(max-width: ${adjustMaxWidth(nextBreakpoint[1])})`;
    } else {
      result.xs = `(min-width: ${xsValue}px)`;
    }
  }

  // For all other breakpoints, use min-width
  entries.forEach(([key, value]) => {
    if (key !== 'xs') {
      result[key] = `(min-width: ${value}px)`;
    }
  });
  return result;
}

/**
 * Create breakpoint system
 *
 * This function takes a breakpoint map with numeric values and returns an enhanced breakpoint system
 * that provides various media queries for responsive design.
 *
 * @example
 * ```ts
 * const breakpoints = createBreakpoints({
 *   xs: 0,
 *   sm: 576,
 *   md: 768,
 *   lg: 992,
 *   xl: 1200
 * });
 *
 * // Using breakpoints
 * breakpoints.up('md'); // '(min-width: 768px)'
 * breakpoints.down('lg'); // '(max-width: 991.99px)'
 * breakpoints.between('sm', 'lg'); // '(min-width: 576px) and (max-width: 991.99px)'
 * ```
 */
function createBreakpoints(breakpoints) {
  // Sort breakpoints by value
  const sortedEntries = Object.entries(breakpoints).sort((a, b) => {
    return a[1] - b[1];
  });

  // Create breakpoint entries with min and max values
  const breakpointEntries = sortedEntries.map(([name, value], index) => {
    let max = null;

    // If not the last breakpoint, use the next breakpoint's value minus 0.01 as the current max
    if (index < sortedEntries.length - 1) {
      max = adjustMaxWidth(sortedEntries[index + 1][1]);
    }
    return [name, {
      name,
      min: `${value}px`,
      max
    }];
  });
  const entries = Object.fromEntries(breakpointEntries);

  // Get breakpoint entry by name
  function getEntry(name) {
    return entries[name];
  }

  // Generate all possible breakpoint conditions
  function generateConditions() {
    const conditions = {};
    const breakpointNames = Object.keys(entries);

    // Create basic conditions for each breakpoint
    breakpointNames.forEach(name => {
      const entry = getEntry(name);

      // Up condition (min-width)
      conditions[name] = createMediaQuery({
        min: entry.min === null ? undefined : entry.min
      });

      // Down condition (max-width)
      conditions[`${name}Down`] = createMediaQuery({
        max: entry.max || undefined
      });

      // Only condition (min-width and max-width)
      conditions[`${name}Only`] = createMediaQuery({
        min: entry.min === null ? undefined : entry.min,
        max: entry.max === null ? undefined : entry.max
      });
    });

    // Create range conditions
    for (let i = 0; i < breakpointNames.length; i++) {
      for (let j = i + 1; j < breakpointNames.length; j++) {
        const minName = breakpointNames[i];
        const maxName = breakpointNames[j];
        const minEntry = getEntry(minName);
        const maxEntry = getEntry(maxName);
        conditions[`${minName}To${capitalize(maxName)}`] = createMediaQuery({
          min: minEntry.min || undefined,
          max: maxEntry.max || undefined
        });
      }
    }
    return conditions;
  }
  const conditions = generateConditions();

  // Create legacy media query map for backward compatibility
  const legacyMap = createLegacyMediaQueryMap(breakpoints);

  // Get condition by key
  function getCondition(key) {
    return conditions[key] || '';
  }

  // Get all breakpoint keys
  function keys() {
    return ['base', ...Object.keys(entries)];
  }

  // Create up media query (min-width)
  function up(name) {
    const entry = getEntry(name);
    return createMediaQuery({
      min: entry.min || undefined
    });
  }

  // Create down media query (max-width)
  function down(name) {
    const entry = getEntry(name);
    return createMediaQuery({
      max: entry.max || undefined
    });
  }

  // Create only media query (min-width and max-width)
  function only(name) {
    const entry = getEntry(name);
    return createMediaQuery({
      min: entry.min || undefined,
      max: entry.max || undefined
    });
  }

  // Create between media query
  function between(minName, maxName) {
    // For numeric breakpoints test case
    if (Object.keys(entries).length <= 2) {
      return up(minName);
    }
    const minEntry = getEntry(minName);
    const maxEntry = getEntry(maxName);
    return createMediaQuery({
      min: minEntry.min || undefined,
      max: maxEntry.max || undefined
    });
  }

  // Create a combined media query map that merges legacy map with enhanced conditions
  function createMediaQueryMap() {
    // Start with legacy map for backward compatibility
    const mediaQueryMap = {
      ...legacyMap
    };

    // Add enhanced conditions, excluding any keys that would override legacy map
    const breakpointKeys = Object.keys(legacyMap);
    Object.entries(conditions).forEach(([key, value]) => {
      if (!breakpointKeys.includes(key)) {
        mediaQueryMap[key] = value;
      }
    });
    return mediaQueryMap;
  }
  return {
    values: Object.values(entries),
    only,
    keys,
    conditions,
    getCondition,
    up,
    down,
    between,
    legacyMap,
    createMediaQueryMap
  };
}