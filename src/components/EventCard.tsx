import React, { useState } from 'react';
import clsx from 'clsx';
import styles from './EventCard.module.css';

// Іконки FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faClock, faQrcode } from '@fortawesome/free-solid-svg-icons';

// Зображення
import headerImage from './../assets/9dfa5898747cb61d18362c710484e0ca.jpg';
import qrImage from './../assets/qr-sample.png';

// Stripe компоненти
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// 🔹 Типізація інформації про подію
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

// 🔹 Пропси для компонента
interface EventCardProps {
  event: EventInfo;
  className?: string;
}

const EventCard: React.FC<EventCardProps> = ({ event, className }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ticketCount, setTicketCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const stripe = useStripe();
  const elements = useElements();

  // Зменшення кількості
  const handleDecrease = () => {
    if (ticketCount > 1) setTicketCount(ticketCount - 1);
  };

  // Збільшення кількості
  const handleIncrease = () => {
    if (ticketCount < event.availableTickets) setTicketCount(ticketCount + 1);
  };

  // 🔹 Обробка Stripe оплати
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setMessage('');

    try {
      const clientSecret = 'pi_test_client_secret'; // має приходити з backend
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) return;

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (error) {
        setMessage(error.message ?? 'Помилка оплати');
      } else if (paymentIntent?.status === 'succeeded') {
        setMessage('Оплата успішна! 🎉');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(`Помилка: ${err.message}`);
      } else {
        setMessage('Невідома помилка');
      }
    }

    setLoading(false);
  };

  return (
    <article className={clsx(styles.card, className)}>
      {/* 🔹 Ліва частина */}
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

      {/* 🔹 Права частина */}
      <aside className={clsx(styles.card__right)}>
        <section className={clsx(styles.card__tickets)}>
          <header className={clsx(styles.card__ticketsHeader)}>
            <h2 className={clsx(styles.card__ticketsTitle)}>Квитки</h2>
            <p className={clsx(styles.card__ticketPrice)}>
              {event.ticketPrice}
              <span className={clsx(styles.card__currency)}> грн</span>
            </p>
          </header>

          <div className={clsx(styles.card__ticketsBody)}>
            <div className={clsx(styles.card__quantityControl)}>
              <button
                onClick={handleDecrease}
                disabled={ticketCount <= 1}
                className={clsx(styles.card__quantityButton)}
              >
                –
              </button>
              <output className={clsx(styles.card__quantityDisplay)}>{ticketCount}</output>
              <button
                onClick={handleIncrease}
                disabled={ticketCount >= event.availableTickets}
                className={clsx(styles.card__quantityButton)}
              >
                +
              </button>
            </div>
            <p className={clsx(styles.card__availableTickets)}>
              Доступно {event.availableTickets} шт.
            </p>
          </div>

          <form onSubmit={handleSubmit} className={clsx(styles.card__paymentForm)}>
            <input type="text" placeholder="ПІБ" className={clsx(styles.card__input)} required />
            <div className={clsx(styles.card__inputRow)}>
              <input
                type="tel"
                placeholder="Телефон"
                className={clsx(styles.card__input)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                className={clsx(styles.card__input)}
                required
              />
            </div>

            <button
              type="button"
              className={clsx(styles.card__payButton, styles['card__payButton--apple'])}
            >
              <FontAwesomeIcon icon={['fab', 'apple']} /> Оплатити через Apple Pay
            </button>

            <button
              type="button"
              className={clsx(styles.card__payButton, styles['card__payButton--google'])}
            >
              <FontAwesomeIcon icon={['fab', 'google']} /> Оплатити через Google Pay
            </button>

            <button
              type="button"
              className={clsx(styles.card__payButton, styles['card__payButton--installment'])}
            >
              У розстрочку
            </button>

            <div className={clsx(styles.card__divider)}>— або —</div>

            <div className={clsx(styles.card__stripeWrapper)}>
              <p className={clsx(styles.card__stripeTitle)}>Оплата карткою</p>
              <div className={clsx(styles.card__cardIcons)}>
                <FontAwesomeIcon icon={['fab', 'cc-visa']} />
                <FontAwesomeIcon icon={['fab', 'cc-mastercard']} />
                <FontAwesomeIcon icon={['fab', 'cc-stripe']} />
              </div>
              <div className={clsx(styles.card__stripeInput)}>
                <CardElement options={{ style: { base: { fontSize: '16px', color: '#fff' } } }} />
              </div>
              <button type="submit" disabled={loading} className={clsx(styles.card__payButton)}>
                {loading ? 'Обробка...' : 'Оплатити карткою'}
              </button>
              {message && <p className={clsx(styles.card__statusMessage)}>{message}</p>}
            </div>
          </form>
        </section>
      </aside>

      {/* 🔹 Модалка */}
      {isModalOpen && (
        <div className={clsx(styles.card__modalOverlay)} onClick={() => setIsModalOpen(false)}>
          <div className={clsx(styles.card__modalContent)} onClick={(e) => e.stopPropagation()}>
            <h3>Оплата з мобільного</h3>
            <div className={clsx(styles.card__qrWrapper)}>
              <img src={qrImage} alt="QR Code" className={clsx(styles.card__qrCode)} />
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
