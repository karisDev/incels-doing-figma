import { CSSData } from './getCssDataForTag'
import { Tag } from './buildTagTree'
import { buildClassName } from './utils/cssUtils'
import { camelcase } from 'varname'

export type CssStyle = 'css' | 'styled-components'

function buildArray(tag: Tag, arr: CSSData[]): CSSData[] {
  if (!tag.isComponent) {
    arr.push(tag.css)
  }

  tag.children.forEach((child) => {
    arr = buildArray(child, arr)
  })

  return arr
}

export function buildCssString(tag: Tag, cssStyle: CssStyle): string {
  const cssArray = buildArray(tag, [])
  let codeStr = cssStyle === 'styled-components' ? 'import styled from "styled-components"\n\n' : ''

  if (!cssArray) {
    return codeStr
  }

  const usedClasses: string[] = []
  cssArray.forEach((cssData) => {
    if (!cssData || cssData.properties.length === 0) {
      return
    }
    const className = camelcase(cssData?.className)
    if (usedClasses.includes(className)) return

    usedClasses.push(className)
    const cssStr =
      cssStyle === 'styled-components'
        ? `export const ${className} = styled.div\`
${cssData.properties.map((property) => `  ${property.name}: ${property.value};`).join('\n')}
\`\n`
        : `.${buildClassName(cssData?.className)} {
${cssData.properties.map((property) => `  ${property.name}: ${property.value};`).join('\n')}
}\n`

    codeStr += cssStr
  })

  return codeStr
}
