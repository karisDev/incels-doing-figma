import { UnitType } from './buildSizeStringByUnit'
import { CSSData, getCssDataForTag, TextCount } from './getCssDataForTag'
import { isImageNode } from './utils/isImageNode'
//@ts-ignore
import { btoa } from './utils/base64.ts'

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
    const CHUNK_SIZE = 0x8000
    let index = 0
    const length = u8Arr.length
    let result = ''
    let slice
    while (index < length) {
      slice = u8Arr.subarray(index, length > index + CHUNK_SIZE ? index + CHUNK_SIZE : length)

      result += String.fromCharCode.apply(null, Array.from(slice))

      index += CHUNK_SIZE
    }
    return btoa(result)
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
