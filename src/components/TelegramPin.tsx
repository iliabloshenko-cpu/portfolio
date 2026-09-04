const TELEGRAM_URL = 'https://t.me/Ilia_B23';

/**
 * Pinned next to the sticky page header so the contact stays one tap away
 * anywhere in a long scroll.
 */
export default function TelegramPin() {
  return (
    <a
      className="tg-pin"
      href={TELEGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
           strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
      Telegram для связи
    </a>
  );
}
