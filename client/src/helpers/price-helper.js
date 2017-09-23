import formatter from 'currency-formatter';

export function formatPrice(price, code = 'CAD') {
  return formatter.format(price, { code: code });
}