/*
  A store that handles that keeps track of "steps"
  that need to be taken for a successful conversion.
*/

import { writable, derived, get } from "svelte/store";

const isOpen = writable(false);
const open = () => {
  isOpen.update(() => true);
};
const close = () => {
  isOpen.update(() => false);
};

const Step = ({ text, fn, onSuccess, onFailure }) => {
  const step = writable({
    text,
    error: undefined,
    fn,
    pending: false,
    success: undefined,
    txHash: undefined,
    onSuccess,
    onFailure
  });

  // wrap fn to provide step instance
  step.update(_step => {
    _step.fn = () => {
      return fn(step);
    };

    return _step;
  });

  return step;
};

const SyncStep = fn => step => {
  step.update(o => ({
    ...o,
    error: undefined,
    success: undefined,
    pending: true
  }));

  const fail = error => {
    step.update(o => ({
      ...o,
      error,
      success: undefined,
      pending: false
    }));

    const onFailure = get(step).onFailure;
    if (onFailure) onFailure(step);
  };

  return fn(step)
    .then(tx => {
      tx.getTxHash()
        .then(txHash => {
          step.update(o => ({
            ...o,
            txHash
          }));
        })
        .catch(error => {
          console.error(error);
          fail(error);
        });

      return tx
        .getReceipt()
        .then(() => {
          step.update(o => ({
            ...o,
            success: true,
            pending: false
          }));

          onStep.update(val => {
            return ++val;
          });

          const onSuccess = get(step).onSuccess;
          if (onSuccess) onSuccess(step);
        })
        .catch(error => {
          console.error(error);
          fail(error);
        });
    })
    .catch(error => {
      console.error(error);
      fail(error);
    });
};

const steps = writable([]);
const onStep = writable(0);

const addSteps = _steps => {
  steps.update(() => _steps);
};

const clearSteps = () => {
  steps.update(() => []);
};

export {
  isOpen,
  open,
  close,
  steps,
  onStep,
  Step,
  SyncStep,
  addSteps,
  clearSteps
};
