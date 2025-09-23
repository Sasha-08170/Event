import React, { useState } from 'react';
import clsx from 'clsx';
import styles from './EventCard.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faClock, faQrcode } from '@fortawesome/free-solid-svg-icons';
import headerImage from './../assets/9dfa5898747cb61d18362c710484e0ca.jpg';
import qrImage from './../assets/qr-sample.png';

interface EventInfo {
  title: string;
  subtitle: string;
  date: string;
  time: string;
  location: string;
  address: string;
  description: string[];
  organizerPhone: string;
  headerImage?: string;
  ticketPrice: number;
  availableTickets: number;
}

interface EventCardProps {
  event: EventInfo;
  className?: string;
}

const EventCard: React.FC<EventCardProps> = ({ event, className }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ticketCount, setTicketCount] = useState(1);

  const handleDecrease = () => {
    if (ticketCount > 1) setTicketCount(ticketCount - 1);
  };

  const handleIncrease = () => {
    if (ticketCount < event.availableTickets) setTicketCount(ticketCount + 1);
  };

  return (
    <article className={clsx(styles.card, className)}>
      {/* Ліва частина */}
      <section className={clsx(styles.card__left)}>
        <header className={clsx(styles.card__header)}>
          <div className={clsx(styles.card__headerImageWrapper)}>
            <img
              src={event.headerImage || headerImage}
              alt={event.title}
              className={clsx(styles.card__headerImage)}
            />
          </div>
          <div className={clsx(styles.card__headerContent)}>
            <h2 className={clsx(styles.card__title)}>{event.title}</h2>
            <p className={clsx(styles.card__subtitle)}>{event.subtitle}</p>

            <address className={clsx(styles.card__location)}>
              <FontAwesomeIcon icon={faMapMarkerAlt} className={clsx(styles.card__icon)} />
              {event.location}, {event.address}
            </address>

            <time className={clsx(styles.card__dateTime)} dateTime={`${event.date}T${event.time}`}>
              <FontAwesomeIcon icon={faClock} className={clsx(styles.card__icon)} />
              {event.date} • {event.time}
            </time>
          </div>
        </header>

        <section className={clsx(styles.card__description)}>
          {event.description.map((text, idx) => (
            <p key={idx}>{text}</p>
          ))}
        </section>

        <footer className={clsx(styles.card__footer)}>
          <button
            className={clsx(styles.card__payMobile)}
            onClick={() => setIsModalOpen(true)}
            aria-label="Оплатити з мобільного"
          >
            <FontAwesomeIcon icon={faQrcode} className={clsx(styles.card__payMobileIcon)} />
            <span className={clsx(styles.card__payMobileText)}>Оплатити з мобільного</span>
          </button>

          <div className={clsx(styles.card__contacts)}>
            <p className={clsx(styles.card__contactsTitle)}>Контакти організатора</p>
            <p className={clsx(styles.card__contactsPhone)}>{event.organizerPhone}</p>
          </div>
        </footer>
      </section>

      {/* Права частина */}
      <aside className={clsx(styles.card__right)}>
        <section className={clsx(styles.card__tickets)}>
          <header className={clsx(styles.card__ticketsHeader)}>
            <h2 className={clsx(styles.card__ticketsTitle)}>Квитки</h2>
            <p className={clsx(styles.card__ticketPrice)}>
              {event.ticketPrice}
              <span className={clsx(styles.card__currency)}>UAH</span>
            </p>
          </header>

          <div className={clsx(styles.card__ticketsBody)}>
            <div className={clsx(styles.card__quantityControl)}>
              <button
                className={clsx(styles.card__quantityButton, styles['card__quantityButton--minus'])}
                onClick={handleDecrease}
                disabled={ticketCount <= 1}
                aria-label="Зменшити кількість"
              >
                –
              </button>

              <output className={clsx(styles.card__quantityDisplay)} aria-live="polite">
                {ticketCount}
              </output>

              <button
                className={clsx(styles.card__quantityButton, styles['card__quantityButton--plus'])}
                onClick={handleIncrease}
                disabled={ticketCount >= event.availableTickets}
                aria-label="Збільшити кількість"
              >
                +
              </button>
            </div>

            <p className={clsx(styles.card__availableTickets)}>
              Доступно {event.availableTickets} шт.
            </p>
          </div>
        </section>
      </aside>

      {/* Модальне вікно */}
      {isModalOpen && (
        <div
          className={clsx(styles.card__modalOverlay)}
          onClick={() => setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className={clsx(styles.card__modalContent)} onClick={(e) => e.stopPropagation()}>
            <h3 className={clsx(styles.card__modalTitle)}>Оплата з мобільного</h3>
            <div className={clsx(styles.card__qrWrapper)}>
              <img src={qrImage} alt="QR Code для оплати" className={clsx(styles.card__qrCode)} />
            </div>
            <button
              className={clsx(styles.card__closeButton)}
              onClick={() => setIsModalOpen(false)}
            >
              Закрити
            </button>
          </div>
        </div>
      )}
    </article>
  );
};

export default EventCard;
