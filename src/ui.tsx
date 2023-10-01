import React, { useEffect, useState, FC } from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter';
import ReactDOM from "react-dom/client";
import codeTheme from 'react-syntax-highlighter/dist/esm/styles/hljs/night-owl';
import { CssStyle } from './buildCssString'
import { messageTypes } from './messagesTypes'
import { RiFolderDownloadLine, RiFileCopyFill } from 'react-icons/ri'
import styles from './ui.css'
import Spacer from './ui/Spacer'
import { Button, NextUIProvider, Loading } from '@nextui-org/react';
import { copy, download, getCSSHighlightLang } from './ui/lib';
import { cssStyles } from './ui/constants/cssStyles';
import { getCompiledCode } from './ui/lib/api';
import { downloadProject } from './ui/lib/api/downloadProject/downloadProject';

const App: FC = () => {
  const [code, setCode] = useState('')
  const [css, setCSS] = useState('')
  const [page, setPage] = useState<'code' | 'css'>('code')
  const [selectedCssStyle, setCssStyle] = useState<CssStyle>('css')
  const [downloading, setDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false)

  const copyToClipboard = () => {
    copy(page === "code" ? code : css)
    setIsCopied(true)

    const msg: messageTypes = { type: 'notify-copy-success' }
    parent.postMessage(msg, '*')
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsCopied(false)
    }, 1000)

    return () => {
      clearInterval(timeout)
    }
  }, [isCopied])

  const notifyChangeCssStyle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const msg: messageTypes = { type: 'new-css-style-set', cssStyle: event.target.value as CssStyle }
    parent.postMessage({ pluginMessage: msg }, '*')
  }


  const handleDownloadProject = async () => {
    setDownloading(true);

    const base64 = btoa(encodeURIComponent(code + "\n\n" + css));

    const result = await getCompiledCode({
      data: base64,
      style: selectedCssStyle === "styled-components" ? "styled" : "css",
    })
    const { uuid } = await result.json();

    const file = await downloadProject({ uuid });
    const blob = await file.blob();
    const url = window.URL.createObjectURL(blob);

    download(url, 'project', 'zip')

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

            <SyntaxHighlighter className={styles.codeHighlighter} language={page === 'code' ? 'JavaScript' : getCSSHighlightLang(selectedCssStyle)} style={codeTheme}>
              {page === "code" ? code : css}
            </SyntaxHighlighter>

          <Spacer axis="vertical" size={12} />

          <div className={styles.buttons}>
            <Button onClick={copyToClipboard} color={isCopied ? 'success' : 'primary'} bordered icon={<RiFileCopyFill />}>{isCopied ? 'Скопировано' : 'Скопировать'}</Button>
            <Button disabled={downloading} onClick={handleDownloadProject} color="primary" icon={<RiFolderDownloadLine />}>
              {downloading ? <Loading color="primary" size="md" /> : 'Скачать код'}
            </Button>
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
