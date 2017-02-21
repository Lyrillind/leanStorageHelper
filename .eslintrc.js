module.exports = {
    "parser": "babel-eslint",
    "env": {
      "browser": true,
      "node": true,
      "es6": true
    },
    "parserOptions": {
      "ecmaFeatures": {
          "experimentalObjectRestSpread": true,
          "arrowFunctions": true,
          "forOf": true,
          "modules": true,
          "generators": true
      },
      "ecmaVersion": 6
    },
    "extends": ["eslint:recommended"],
    "installedESLint": true,
    "rules": {
      "no-console": "off",
      "react/no-find-dom-node": "off"
    }
};
