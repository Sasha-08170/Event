import React, { useState, useCallback } from 'react';
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

// Константи
const PAYMENT_STATUSES = {
  PROCESSING: 'Обробка...',
  SUCCESS: 'Оплата успішна! 🎉',
  ERROR: 'Помилка оплати',
  UNKNOWN_ERROR: 'Невідома помилка'
} as const;

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

// Улучшенная типизация
interface PaymentError {
  message: string;
  code?: string;
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
  const [error, setError] = useState<PaymentError | null>(null);

  const stripe = useStripe();
  const elements = useElements();

  // Оптимизированные обработчики
  const handleDecrease = useCallback(() => {
    setTicketCount(prev => Math.max(1, prev - 1));
  }, []);

  const handleIncrease = useCallback(() => {
    setTicketCount(prev => Math.min(event.availableTickets, prev + 1));
  }, [event.availableTickets]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleModalOpen = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  // Улучшенная обработка оплаты
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setError({ message: 'Stripe не инициализирован' });
      return;
    }

    setLoading(true);
    setMessage('');
    setError(null);

    try {
      const clientSecret = 'pi_test_client_secret';
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Элемент карты не найден');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (stripeError) {
        setError({ message: stripeError.message || PAYMENT_STATUSES.ERROR, code: stripeError.code });
      } else if (paymentIntent?.status === 'succeeded') {
        setMessage(PAYMENT_STATUSES.SUCCESS);
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : PAYMENT_STATUSES.UNKNOWN_ERROR
      });
    } finally {
      setLoading(false);
    }
  };

  // Мемоизированные вычисления
  const totalPrice = React.useMemo(() => 
    event.ticketPrice * ticketCount, 
    [event.ticketPrice, ticketCount]
  );

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
            onClick={handleModalOpen}
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
              {totalPrice}
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
        <div className={clsx(styles.card__modalOverlay)} onClick={handleModalClose}>
          <div className={clsx(styles.card__modalContent)} onClick={(e) => e.stopPropagation()}>
            <h3>Оплата з мобільного</h3>
            <div className={clsx(styles.card__qrWrapper)}>
              <img src={qrImage} alt="QR Code" className={clsx(styles.card__qrCode)} />
            </div>
            <button
              className={clsx(styles.card__closeButton)}
              onClick={handleModalClose}
            >
              Закрити
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className={clsx(styles.card__errorMessage)}>
          {error.message}
        </p>
      )}
    </article>
  );
};

// Мемоизация компонента
export default React.memo(EventCard);
