export const toCamel = (str: string, firstUpper = false) => {
  let ret = str.replace(/-(\w)/g, function (all, letter) {
    return letter.toUpperCase()
  })

  if (firstUpper) {
    ret = ret.charAt(0).toUpperCase() + ret.substring(1)
  }

  return ret
}

export const toUnderline = (str: string) => str.replace(/([A-Z])/g, "-$1").toLowerCase()
