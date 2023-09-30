import { UnitType } from './buildSizeStringByUnit'
import { CSSData, getCssDataForTag, TextCount } from './getCssDataForTag'
import { isImageNode } from './utils/isImageNode'
//@ts-ignore
import { btoa as Govno } from './utils/govno.js'

type Property = {
  name: string
  value: string
  notStringValue?: boolean
}

export type Tag = {
  name: string
  isText: boolean
  textCharacters: string | null
  isImg: boolean
  properties: Property[]
  css: CSSData
  children: Tag[]
  node: SceneNode
  isComponent?: boolean
}

export async function buildTagTree(node: SceneNode, unitType: UnitType, textCount: TextCount): Promise<Tag | null> {
  if (!node.visible) {
    return null
  }

  const isImg = isImageNode(node)
  const properties: Property[] = []

  const Uint8ToBase64 = (u8Arr: Uint8Array) => {
    const CHUNK_SIZE = 0x8000 // add numeric separators to the hex number
    console.log('11')
    let index = 0
    console.log('10')
    const length = u8Arr.length
    console.log('9')
    let result = ''
    console.log('8')
    let slice
    console.log('7')
    while (index < length) {
      console.log('6')
      slice = u8Arr.subarray(index, length > index + CHUNK_SIZE ? index + CHUNK_SIZE : length)
      console.log('1')
      result += String.fromCharCode.apply(null, Array.from(slice))
      console.log('2')
      index += CHUNK_SIZE
      console.log('3')
    }
    console.log('4')
    return Govno(result)
    console.log('5')
  }

  if (isImg) {
    const image = await node.exportAsync({ format: 'PNG' }) // Unit8Array
    const b64encoded = Uint8ToBase64(image)
    properties.push({ name: 'src', value: `data:image/png;base64,${b64encoded}` })
  }

  const childTags: Tag[] = []

  if ('children' in node && !isImg) {
    for (const child of node.children) {
      const childTag = await buildTagTree(child, unitType, textCount)
      if (childTag) {
        childTags.push(childTag)
      }
    }
  }

  const tag: Tag = {
    name: isImg ? 'img' : node.name,
    isText: node.type === 'TEXT',
    textCharacters: node.type === 'TEXT' ? node.characters : null,
    isImg,
    css: getCssDataForTag(node, unitType, textCount),
    properties,
    children: childTags,
    node
  }

  return tag
}
