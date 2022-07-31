module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "airbnb-base"
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "rules": {
        "no-restricted-syntax" : 0,
        "no-continue" : 0,
        "brace-style": ["error", "stroustrup"],
        "no-return-assign" : 0,
        "no-param-reassign" : 0,
    }
}
