import { CssStyle } from '../../buildCssString';
import cssIcon from '../assets/icons/css.svg';
import scIcon from '../assets/icons/sc.svg';

export const cssStyles: { value: CssStyle; label: string; img: string }[] = [
  { value: 'css', label: 'CSS', img: cssIcon },
  { value: 'styled-components', label: 'styled-components', img: scIcon }
]
