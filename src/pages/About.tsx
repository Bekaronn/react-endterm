import { useState } from 'react';
import { Mail, Phone, Github, User } from 'lucide-react';
import '../styles/About.css';

export default function About() {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="about-container">
      <h1 className="about-title">Обо мне</h1>

      <p className="about-text">
        Привет! Меня зовут Бекарыс, я разработчик, увлечённый созданием
        надёжных и масштабируемых web-приложений. Работаю с{' '}
        <strong>FastAPI, Go, Angular и React</strong>, проектирую устойчивые
        бэкенды и интеграции с внешними API.
        Особый интерес — автоматизация процессов, работа с данными (парсинг,
        интеграция, кэширование, фоновая обработка) и продуманный UI/UX.
      </p>

      <p className="about-text">
        Сейчас развиваю SaaS-проект, использующий{' '}
        <strong>FastAPI + Go</strong> на сервере и{' '}
        <strong>Angular/React</strong> на фронтенде. Люблю продумывать архитектуру,
        чтобы код оставался чистым, надёжным и понятным.
      </p>

      <div className="contact-section">
        <h2 className="contact-title">Контакты</h2>
        <ul className="contact-list">
          <li>
            <Mail size={20} />
            <strong>Email:</strong>
            <span
              className="copy-text"
              onClick={() => handleCopy('bekadron231316@gmail.com', 'Email')}
            >
              bekadron231316@gmail.com
            </span>
            {copied === 'Email' && (
              <span className="copied-tooltip">Скопировано!</span>
            )}
          </li>

          <li>
            <Phone size={20} />
            <strong>Телефон:</strong>
            <span
              className="copy-text"
              onClick={() => handleCopy('+77078508269', 'Телефон')}
            >
              +7 707 850 82 69
            </span>
            {copied === 'Телефон' && (
              <span className="copied-tooltip">Скопировано!</span>
            )}
          </li>

          <li>
            <Github size={20} />
            <strong>GitHub:</strong>
            <a
              href="https://github.com/Bekaronn"
              target="_blank"
              rel="noreferrer"
            >
              github.com/Bekaronn
            </a>
          </li>

          <li>
            <User size={20} />
            <strong>LinkedIn:</strong>
            <a
              href="https://kz.linkedin.com/in/bekarysm"
              target="_blank"
              rel="noreferrer"
            >
              linkedin.com/in/bekarysm
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

