export const download = (url: string, name: string, extension: string) => {
  const link = document.createElement("a");

  link.href = url;
  link.download = `${name}.${extension}`;
  link.click();
  link.remove();
}
