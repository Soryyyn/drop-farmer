/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,js,,ts,tsx}'],
    theme: {
        colors: {
            pepper: {
                50: '#040406',
                100: '#0c0d13',
                200: '#151620',
                300: '#1d1f2c',
                400: '#212332',
                500: '#252839',
                600: '#292c3f',
                700: '#3b3e61',
                800: '#414569',
                900: '#4D527A'
            },
            snow: {
                300: '#bad5f1',
                500: '#c8def5'
            },
            blood: {
                500: '#e74b65',
                600: '#ff0044',
                700: '#fad2dd'
            },
            sky: {
                500: '#347bff'
            },
            amber: {
                500: '#f1851f'
            },
            pineapple: {
                500: '#f8e059'
            },
            leaf: {
                500: '#21db87'
            }
        },
        extend: {
            height: {
                modal: 'calc(100% - 7rem)'
            },
            width: {
                modal: 'calc(100% - 7rem)'
            },
            transitionProperty: {
                scale: 'height, width'
            }
        }
    },
    plugins: []
};
