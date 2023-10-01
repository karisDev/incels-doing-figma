import { request } from '../../http';

export const getCompiledCode = (data: { data: string; style: 'styled' | 'css'}) => {
  return request("https://usetech.onixx.ru/compile/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
}
