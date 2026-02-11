'use client';
"use strict";

exports.__esModule = true;
exports.shouldRenderTime = exports.shouldRenderMonth = exports.shouldRenderDate = exports.shouldOnlyRenderTime = exports.shouldOnlyRenderMonth = void 0;
/**
 * Check if the time should be rendered based on the format.
 *
 * @param format - The format string.
 * @returns Whether the time should be rendered.
 */
const shouldRenderTime = format => /([Hhms])/.test(format);

/**
 * Check if the month should be rendered based on the format.
 *
 * @param format - The format string.
 * @returns Whether the month should be rendered.
 */
exports.shouldRenderTime = shouldRenderTime;
const shouldRenderMonth = format => /[Yy]/.test(format) && /[ML]/.test(format);

/**
 * Check if the date should be rendered based on the format.
 *
 * @param format - The format string.
 * @returns Whether the date should be rendered.
 */
exports.shouldRenderMonth = shouldRenderMonth;
const shouldRenderDate = format => /[Yy]/.test(format) && /[ML]/.test(format) && /[Dd]/.test(format);

/**
 * Check if only the time should be rendered based on the format.
 *
 * @param format - The format string.
 * @returns Whether only the time should be rendered.
 */
exports.shouldRenderDate = shouldRenderDate;
const shouldOnlyRenderTime = format => /([Hhms])/.test(format) && !/([YyMDd])/.test(format);

/**
 * Check if only the month should be rendered based on the format.
 */
exports.shouldOnlyRenderTime = shouldOnlyRenderTime;
const shouldOnlyRenderMonth = format => shouldRenderMonth(format) && !shouldRenderDate(format);
exports.shouldOnlyRenderMonth = shouldOnlyRenderMonth;