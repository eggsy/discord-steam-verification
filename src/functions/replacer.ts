export const useReplacer = (string: string, args: string[]) => {
  let newString = string;

  for (let i = 0; i < args.length; i++) {
    newString = newString.replaceAll(`{${i}}`, args[i]);
  }

  return newString;
};
