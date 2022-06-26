import _mergeOptions from 'merge-options';

const mergeOptions = _mergeOptions.bind({
  ignoreUndefined: true,
  concatArrays: true,
});

export default mergeOptions;
