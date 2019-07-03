const fs = require('fs')
const path = require('path')
const os = require('os')
const useTypescript = require('../lib/useTypescript')
const useScss = require('../lib/useScss')

module.exports = function({
  appPath,
  isTypescript,
  styleLang = 'scss'
}) {
  isTypescript && useTypescript()

  useScss && useScss()

  const command = 'npm'
  const args = ['install', '--save', 'react', 'react-dom']
}