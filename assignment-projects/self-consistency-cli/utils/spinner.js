import ora from "ora";

let spinner = null;

/**
 * Start a new spinner
 * @returns {ora.Ora} The spinner instance
 */
export function startSpinner(text = "Loading...") {
  if (spinner) {
    spinner.stop();
  }

  spinner = ora({
    text,
    spinner: "dots",
  }).start();

  return spinner;
}

/**
 * Update spinner text. Starts a new spinner if none is active.
 */
export function updateSpinner(text) {
  if (spinner) {
    spinner.text = text;
  } else {
    // Graceful fallback: start one if it was missed
    startSpinner(text);
  }
}

/**
 * Mark spinner as successful
 */
export function succeedSpinner(text = "Done!") {
  if (spinner) {
    spinner.succeed(text);
    spinner = null;
  }
}

/**
 * Mark spinner as failed
 */
export function failSpinner(text = "Failed!") {
  if (spinner) {
    spinner.fail(text);
    spinner = null;
  }
}

/**
 * Stop spinner without success/failure
 */
export function stopSpinner() {
  if (spinner) {
    spinner.stop();
    spinner = null;
  }
}