/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,js,,ts,tsx}"],
    theme: {
        colors: {
            pepper: {
                100: "#10121b",
                500: "#292c3f"
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
