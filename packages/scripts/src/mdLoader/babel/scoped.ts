import { types as t } from '@babel/core'

const scoped: () => babel.PluginObj = () => {
  return {
    visitor: {
      JSXOpeningElement(path, state) {
        const moduleId = (state.opts as any).moduleId
        const id = t.jsxIdentifier(moduleId)
        const attributes = (path.container as any).openingElement.attributes
        for (let i = 0; i < attributes.length; i++) {
          const name = attributes[i].name;
          if (name?.name === moduleId) {
            // The __source attribute already exists
            return;
          }
        }
        attributes.push(t.jsxAttribute(id, null))
      }
    }
  }
}

export default scoped