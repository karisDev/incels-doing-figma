import { CssStyle } from '../../../buildCssString';

export const getCSSHighlightLang = (cssStyle: CssStyle): string => {
  switch (cssStyle) {
    case 'css':
      return 'css'
    case 'styled-components':
      return 'javascript'
    default:
      return 'css'
  }
}
