function assert(name, f) {
  try {
    if (!f()) {
      console.error("Assertion failed: " + name);
      process.exit(1);
    }
  } catch (err) {
    console.error("While asserting: " + name);
    console.error(err);
    process.exit(1);
  }
}

module.exports = assert;
