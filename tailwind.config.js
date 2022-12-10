/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,js,,ts,tsx}"],
    theme: {
        colors: {
            pepper: {
                100: "#10121b",
                500: "#292c3f",
                700: "#3b3e61",
                800: "#3F4264"
            },
            snow: {
                500: "#c8def5"
            }
        },
        extend: {
            height: {
                modal: "calc(100% - 7rem)"
            },
            width: {
                modal: "calc(100% - 7rem)"
            },
            transitionProperty: {
                scale: "height, width"
            }
        }
    },
    plugins: []
};
