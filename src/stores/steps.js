/*
  A store that handles that keeps track of "steps"
  that need to be taken for a successful conversion.
*/

import { writable, derived } from "svelte/store";

const isOpen = writable(false);
const open = () => {
  isOpen.update(() => true);
};
const close = () => {
  isOpen.update(() => false);
};

const Step = ({ text, fn }) => {
  const step = writable({
    text,
    fn,
    pending: false,
    success: undefined,
    txHash: undefined
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
    pending: true
  }));

  const fail = () => {
    step.update(o => ({
      ...o,
      success: undefined,
      pending: false
    }));
  };

  return fn(step)
    .then(tx => {
      step.update(o => ({
        ...o,
        success: undefined,
        pending: true
      }));

      tx.getTxHash()
        .then(txHash => {
          step.update(o => ({
            ...o,
            txHash
          }));
        })
        .catch(error => {
          console.error(error);
          fail();
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
        })
        .catch(error => {
          console.error(error);
          fail();
        });
    })
    .catch(error => {
      console.error(error);
      fail();
    });
};

const steps = writable([]);
const onStep = writable(0);
const done = derived([steps, onStep], (_steps, _onStep) => {
  return Boolean(_steps.length <= _onStep);
});

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
  done,
  Step,
  SyncStep,
  addSteps,
  clearSteps
};
