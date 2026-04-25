// Formatting utilities

/**
 * Format phone number for display
 * @param phone - Phone number string
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string | undefined | null): string {
  if (!phone) return 'N/A';
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Format Nigerian phone numbers (+234 XXX XXX XXXX)
  if (cleaned.startsWith('234')) {
    const match = cleaned.match(/^(234)(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `+${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
    }
  }

  // Return original if can't format
  return phone;
}

/**
 * Format currency (Naira)
 * @param amount - Amount in naira
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date/time for display
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string
 */
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Less than 1 minute
  if (diffMins < 1) return 'Just now';

  // Less than 1 hour
  if (diffMins < 60) return `${diffMins}m ago`;

  // Less than 24 hours
  if (diffHours < 24) return `${diffHours}h ago`;

  // Less than 7 days
  if (diffDays < 7) return `${diffDays}d ago`;

  // Default format
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Format time only (HH:MM AM/PM)
 * @param dateString - ISO date string or Date object
 * @returns Formatted time string
 */
export function formatTime(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format full date and time
 * @param dateString - ISO date string
 * @returns Formatted date and time string
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format fuel quantity
 * @param quantity - Quantity in liters
 * @returns Formatted quantity string
 */
export function formatFuelQuantity(quantity: number): string {
  return `${quantity}L`;
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}
