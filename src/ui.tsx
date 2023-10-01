import React, { useEffect, useState, useRef, FC, ElementRef } from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter';
import ReactDOM from "react-dom/client";
import codeTheme from 'react-syntax-highlighter/dist/esm/styles/hljs/night-owl';
import { CssStyle } from './buildCssString'
import { messageTypes } from './messagesTypes'
import { RiFolderDownloadLine, RiFileCopyFill } from 'react-icons/ri'
import styles from './ui.css'
import Spacer from './ui/Spacer'
import { Button, NextUIProvider, Radio } from '@nextui-org/react';
import cssIcon from './ui/assets/icons/css.svg'
import scIcon from './ui/assets/icons/sc.svg'

const cssStyles: { value: CssStyle; label: string; img: string }[] = [
  { value: 'css', label: 'CSS', img: cssIcon },
  { value: 'styled-components', label: 'styled-components', img: scIcon }
]

const App: FC = () => {
  const [code, setCode] = useState('')
  const [css, setCSS] = useState('')
  const [page, setPage] = useState<'code' | 'css'>('code')
  const [selectedCssStyle, setCssStyle] = useState<CssStyle>('css')
  const [downloading, setDownloading] = useState(false);

  const copyToClipboard = () => {
    const textArea = document.createElement("textarea");
    textArea.value = page === "code" ? code : css;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);

    const msg: messageTypes = { type: 'notify-copy-success' }
    parent.postMessage(msg, '*')
  }

  const notifyChangeCssStyle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const msg: messageTypes = { type: 'new-css-style-set', cssStyle: event.target.value as CssStyle }
    parent.postMessage({ pluginMessage: msg }, '*')
  }


  const handleDownloadProject = async () => {
    setDownloading(true);

    const base64 = btoa(encodeURIComponent(code + "\n\n" + css));

    const result = await fetch("https://usetech.onixx.ru/compile/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: base64,
        style: selectedCssStyle === "styled-components" ? "styled" : "css",
      }),
    });
    const { uuid } = await result.json();

    const file = await fetch(`https://usetech.onixx.ru/download/${uuid}`);
    const blob = await file.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "project.zip";
    link.click();
    link.remove();

    setDownloading(false);
  }

  useEffect(() => {
    onmessage = (event) => {
      setCssStyle(event.data.pluginMessage.cssStyle)
      const codeStr = event.data.pluginMessage.generatedCodeStr
      const cssStr = event.data.pluginMessage.cssString

      setCode(codeStr)
      setCSS(cssStr)
    }
  }, [])

  return (
    <NextUIProvider>
      <main className={styles.main}>
        <div className={styles.code}>
          <Button onClick={() => setPage(p => p === 'code' ? 'css' : 'code')} color="primary" auto>
            Показать {page === 'code' ? 'стили' : 'компонент'}
          </Button>

          <Spacer axis="vertical" size={12} />

            <SyntaxHighlighter className={styles.codeHighlighter} language={page === "code" || selectedCssStyle === "styled-components" ? "javascript" : "css"} style={codeTheme}>
              {page === "code" ? code : css}
            </SyntaxHighlighter>

          <Spacer axis="vertical" size={12} />

          <div className={styles.buttons}>
            <Button onClick={copyToClipboard} color="primary" bordered icon={<RiFileCopyFill />}>Скопировать</Button>
            <Button disabled={downloading} onClick={handleDownloadProject} color="primary" icon={<RiFolderDownloadLine />}>Скачать код</Button>
          </div>
        </div>
        <div className={styles.settings}>
          <h2 className={styles.heading}>Настройки</h2>

          <Spacer axis="vertical" size={12} />

          <div className={styles.optionList}>
            {cssStyles.map((style) => (
              <label key={style.value} className={styles.option} data-checked={selectedCssStyle === style.value}>
                <input type="radio" name="css-style" id={style.value} value={style.value} checked={selectedCssStyle === style.value} onChange={notifyChangeCssStyle} />
                <div className={styles.optionListWrapper}>
                  <img src={style.img} />
                  <Spacer axis="vertical" size={12} />
                  {style.label}
                </div>
              </label>
            ))}
          </div>
        </div>
      </main>
    </NextUIProvider>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
