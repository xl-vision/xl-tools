export const toCamel = (str: string) => str.replace(/-(\w)/g, function (all, letter) {
  return letter.toUpperCase()
})

export const toUnderline = (str: string) => str.replace(/([A-Z])/g, "-$1").toLowerCase()
