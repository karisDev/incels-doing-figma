const chars: { ascii: () => string, indices: () => Record<string, any>, cache?: Record<string, any>} = {
  ascii: function () {
    return 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  },
  indices: function () {
    if (!this.cache) {
      this.cache = {}
      const ascii = chars.ascii()

      for (let c = 0; c < ascii.length; c++) {
        const chr = ascii[c]
        this.cache[chr] = c
      }
    }
    return this.cache
  }
}

export const btoa = (data: string): string => {
  let ascii = chars.ascii(),
    len = data.length - 1,
    i = -1,
    b64 = ''

  while (i < len) {
    const code = (data.charCodeAt(++i) << 16) | (data.charCodeAt(++i) << 8) | data.charCodeAt(++i)
    b64 += ascii[(code >>> 18) & 63] + ascii[(code >>> 12) & 63] + ascii[(code >>> 6) & 63] + ascii[code & 63]
  }

  const pads = data.length % 3
  if (pads > 0) {
    b64 = b64.slice(0, pads - 3)

    while (b64.length % 4 !== 0) {
      b64 += '='
    }
  }

  return b64
}
