const { promisify } = require("util");
const { join } = require("path");
const { readFile, writeFile } = require("fs");

const root = join(__dirname, "..");
const file = join(
  root,
  "node_modules",
  "rollup-plugin-node-builtins",
  "src",
  "es6",
  "os.js"
);

const patch = async () => {
  const data = await promisify(readFile)(file, "utf8");

  if (data.includes("arch: arch,")) {
    console.log("Successfully patched rollup-plugin-node-builtins library!");
    return;
  }

  const result = data.replace(
    "endianness: endianness,",
    "endianness: endianness,arch: arch,"
  );

  await promisify(writeFile)(file, result, "utf8");
  console.log("Successfully patched rollup-plugin-node-builtins library!");
};

patch();
