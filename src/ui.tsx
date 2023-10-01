import React, { useEffect, useState, useRef, FC } from 'react'
import ReactDOM from 'react-dom';
import SyntaxHighlighter from 'react-syntax-highlighter';
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
  const [selectedCssStyle, setCssStyle] = useState<CssStyle>('css')
  const textRef = useRef<HTMLTextAreaElement | null>(null)

  const copyToClipboard = () => {
    if (textRef.current) {
      if ('select' in textRef.current) {
        textRef.current!.select()
      }
      document.execCommand('copy')

      const msg: messageTypes = { type: 'notify-copy-success' }
      parent.postMessage(msg, '*')
    }
  }

  const notifyChangeCssStyle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const msg: messageTypes = { type: 'new-css-style-set', cssStyle: event.target.value as CssStyle }
    parent.postMessage({ pluginMessage: msg }, '*')
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
          <Radio value="css" color="primary">
            CSS
          </Radio>
          <Radio value="react" color="primary">
            React
          </Radio>

          <Spacer axis="vertical" size={12} />

          <SyntaxHighlighter className={styles.codeHighlighter} language="javascript" style={codeTheme}>
            {code}
          </SyntaxHighlighter>

          <Spacer axis="vertical" size={12} />

          <div className={styles.buttons}>
            <Button onClick={copyToClipboard} color="primary" bordered icon={<RiFileCopyFill />}>Скопировать</Button>
            <Button color="primary" icon={<RiFolderDownloadLine />}>Скачать архив</Button>
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

ReactDOM.render(<App />, document.getElementById('root'))
