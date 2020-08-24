export function replaceItems(
  oldValues: string[],
  newValues: string[],
  input: string
): string {
  for (let i = 0; i < oldValues.length; i++)
    input = input.replace(oldValues[i], newValues[i]);
  return input;
}
