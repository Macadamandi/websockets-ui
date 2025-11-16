// Generate custom UUID
export const generateUUID = (): string => {
  const uuidTemplate = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx";

  return uuidTemplate.replaceAll("x", () => {
    const randomValue = Math.floor(Math.random() * 16);
    return randomValue.toString(16);
  });
};
