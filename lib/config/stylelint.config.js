module.exports = {
    "extends": [
        "stylelint-config-standard",
        "stylelint-config-rational-order"
    ],
    "plugins": [
        "stylelint-scss"
    ],
    "rules": {
        "at-rule-no-unknown": null,
        "scss/at-rule-no-unknown": true,
        "number-leading-zero": null,
        "color-hex-length": "long"
    }
}