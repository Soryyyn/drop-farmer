import type { Config } from 'tailwindcss';

const TailwindConfig: Config = {
    content: ['./src/**/*.{ts,tsx}'],
    theme: {
        colors: {
            transparent: '#00000000',
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
                300: '#ff0044',
                400: '#D8415A',
                500: '#e74b65',
                550: '#F45890',
                700: '#fad2dd'
            },
            sky: {
                500: '#347bff',
                550: '#349EFF'
            },
            amber: {
                500: '#f1851f',
                550: '#F3835F'
            },
            pineapple: {
                500: '#f8e059',
                550: '#F3E17A'
            },
            leaf: {
                400: '#318777',
                500: '#21db87',
                550: '#34DEBF'
            },
            amethyst: {
                400: '#7F56FF',
                500: '#9173F2',
                550: '#9795FF'
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
    variants: {
        scrollbar: ['rounded']
    },
    plugins: [
        require('@tailwindcss/typography'),
        require('tailwind-scrollbar')({ nocompatible: true })
    ]
};

export default TailwindConfig;
