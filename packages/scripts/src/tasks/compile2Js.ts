import compileJs from '../lib/compileJs'
import compileTs from '../lib/compileTs'
import getProjectPath from '../utils/getProjectPath'
import fs from 'fs-extra';

export type Options = {
  dir: string,
  dest: string,
  suffixes: Array<string>,
  isEs: boolean,
  tsConfigFile?: string
}

export default async (options: Options) => {
  const {
    isEs,
    dir,
    suffixes,
    dest,
    tsConfigFile
  } = options

  for (const suffix of suffixes) {
    const src = [`${dir}/**/*.${suffix}`, '!**/__*__/**']
    if (suffix === 'js' || suffix === 'jsx') {
      await compileJs(src, dest, {isEs})
    } else if (suffix === 'ts' || suffix === 'tsx') {
      if (!tsConfigFile) {
        throw new Error("Please provide option 'tsconfigFile'.")
      }
      const tsConfigFilePath = getProjectPath(tsConfigFile)
      if (!fs.existsSync(tsConfigFilePath)) {
        throw new Error('Could not find tsconfig file: ' + tsConfigFile)
      }
      await compileTs(src, dest, {
        isEs,
        tsConfigFile: tsConfigFilePath
      })
    }
  }
}
