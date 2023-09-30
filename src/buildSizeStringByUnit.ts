export type UnitType = 'px' | 'rem' | 'remAs10px'

export function buildSizeStringByUnit(pixelValue: number | PluginAPI['mixed'], type: UnitType): string {
  if (type === 'px') {
    return Number(pixelValue) + 'px'
  }
  if (type === 'rem') {
    return Number(pixelValue) / 16 + 'rem'
  }
  return Number(pixelValue) / 10 + 'rem'
}
