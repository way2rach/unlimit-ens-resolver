export function handleErrorMessagesFactory(
  setter: React.Dispatch<React.SetStateAction<string>>
) {
  return function handleErrorMessages(errorOptions: {
    err?: Error;
    customMessage?: string;
  }) {
    const { err, customMessage } = errorOptions;
    if (err) {
      if (err.data) {
        if (
          err.data.message.includes("execution reverted:")
        ) {
          setter(err.data.message.replace("execution reverted:", ""));
        } else {
          setter(err.data.message);
        }
      } else {
        setter(err.message);
      }
      console.log(err);
    } else if (customMessage) {
      setter(customMessage);
    }
  };
}
