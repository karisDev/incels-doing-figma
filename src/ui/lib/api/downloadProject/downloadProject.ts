export const downloadProject = ({ uuid }: { uuid: string }) => {
  return fetch(`https://usetech.onixx.ru/download/${uuid}`)
}
