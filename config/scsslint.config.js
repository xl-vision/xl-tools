module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-rational-order'],
  plugins: ['stylelint-scss'],
  rules: {
    'at-rule-no-unknown': null,
    'color-hex-length': 'long',
    'number-leading-zero': null,
    'scss/at-rule-no-unknown': true
  }
}