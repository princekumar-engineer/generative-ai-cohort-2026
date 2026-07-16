import { encoding_for_model } from "tiktoken";

const encoder = encoding_for_model("gpt-4o");

const text = "Hello, I am PRINCE";
const tokens = encoder.encode(text);

console.log("Tokens:", Array.from(tokens));

const tokenArray = [13225, 11, 357, 939, 1689, 380, 115904];
const decoded = encoder.decode(tokenArray);

console.log("Decoded Text:", new TextDecoder().decode(decoded));

// Free resources when done
encoder.free();