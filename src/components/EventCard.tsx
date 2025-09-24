import React, { useState, useCallback } from 'react';
import { Formik, Form, Field } from 'formik';
import type { FormikHelpers } from 'formik';
import clsx from 'clsx';
import styles from './EventCard.module.css';
import * as Yup from 'yup';

// Іконки FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarkerAlt, 
  faClock, 
  faQrcode,
  faCreditCard // добавляем иконку карты
} from '@fortawesome/free-solid-svg-icons';

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

// Типізація інформації про подію
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


interface PaymentError {
  message: string;
  code?: string;
}

// Пропси для компонента
interface EventCardProps {
  event: EventInfo;
  className?: string;
}

const UKRAINIAN_BANKS = [
  { name: 'Monobank', icon: faCreditCard },
  { name: 'ПУМБ', icon: faCreditCard },
] as const;

// Схема валидации
const PaymentSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(2, 'Занадто коротке ім\'я')
    .max(50, 'Занадто довге ім\'я')
    .required('Обов\'язкове поле'),
  phone: Yup.string()
    .matches(/^\+?[0-9]{10,12}$/, 'Невірний формат телефону')
    .required('Обов\'язкове поле'),
  email: Yup.string()
    .email('Невірний email')
    .required('Обов\'язкове поле'),
});

// Обновляем интерфейс и обработчики
interface FormValues {
  fullName: string;
  phone: string;
  email: string;
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

  // Обработка оплаты
  const handleStripeSubmit = async (formValues: FormValues) => {
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
        payment_method: { 
          card: cardElement,
          billing_details: {
            name: formValues.fullName,
            email: formValues.email,
            phone: formValues.phone
          }
        }
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

  const initialValues: FormValues = {
    fullName: '',
    phone: '',
    email: ''
  };

  const handleFormSubmit = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    try {
      setLoading(true);
      await handleStripeSubmit(values);
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Помилка оплати'
      });
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  // Мемоизированные вычисления
  const totalPrice = React.useMemo(() => 
    event.ticketPrice * ticketCount, 
    [event.ticketPrice, ticketCount]
  );

  return (
    <div className={styles.card__wrapper}>
      <article className={clsx(styles.card, className)}>
        {/* Левая часть */}
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

        {/* Правая часть */}
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
                  title='Зменшити кількість'
                >
                  –
                </button>
                <output 
                className={clsx(styles.card__quantityDisplay)}>{ticketCount}</output>
                <button
                  onClick={handleIncrease}
                  disabled={ticketCount >= event.availableTickets}
                  className={clsx(styles.card__quantityButton)}
                  title='Збільшити кількість'
                >
                  +
                </button>
              </div>
              <p className={clsx(styles.card__availableTickets)}>
                Доступно {event.availableTickets} шт.
              </p>
            </div>

            <Formik
              initialValues={initialValues}
              validationSchema={PaymentSchema}
              onSubmit={handleFormSubmit}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form className={clsx(styles.card__paymentForm)}>
                  <div className={clsx(styles.card__inputWrapper)}>
                    <Field
                      name="fullName"
                      placeholder="ПІБ"
                      className={clsx(
                        styles.card__input,
                        errors.fullName && touched.fullName && styles.card__input_error
                      )}
                    />
                    {errors.fullName && touched.fullName && (
                      <div className={styles.card__errorText}>{errors.fullName}</div>
                    )}
                  </div>

                  <div className={clsx(styles.card__inputRow)}>
                    <div className={clsx(styles.card__inputWrapper)}>
                      <Field
                        name="phone"
                        type="tel"
                        placeholder="Телефон"
                        className={clsx(
                          styles.card__input,
                          errors.phone && touched.phone && styles.card__input_error
                        )}
                        title='Введіть номер телефону'
                      />
                      {errors.phone && touched.phone && (
                        <div className={styles.card__errorText}>{errors.phone}</div>
                      )}
                    </div>

                    <div className={clsx(styles.card__inputWrapper)}>
                      <Field
                        name="email"
                        type="email"
                        placeholder="Email"
                        className={clsx(
                          styles.card__input,
                          errors.email && touched.email && styles.card__input_error
                        )}
                        title='Введіть email'
                      />
                      {errors.email && touched.email && (
                        <div className={styles.card__errorText}>{errors.email}</div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className={clsx(styles.card__payButton, styles['card__payButton--apple'])}
                    title='Оплатити через Apple Pay'
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
                    
                    {/* Банки */}
                    <div className={clsx(styles.card__bankButtons)}>
                      {UKRAINIAN_BANKS.map((bank) => (
                        <button
                          key={bank.name}
                          type="button"
                          className={clsx(styles.card__bankButton)}
                          title='Оплатити через банк'
                        >
                          <FontAwesomeIcon icon={bank.icon} className={clsx(styles.card__bankIcon)} />
                          {bank.name}
                        </button>
                      ))}
                    </div>

                    <div className={clsx(styles.card__divider)}>— або —</div>

                    <div className={clsx(styles.card__cardIcons, styles.card__cardIconsWhite)}>
                      <FontAwesomeIcon icon={['fab', 'cc-visa']} />
                      <FontAwesomeIcon icon={['fab', 'cc-mastercard']} />
                    </div>

                    <div className={clsx(styles.card__stripeInput)}>
                      <CardElement 
                        options={{ 
                          style: { 
                            base: { 
                              fontSize: '16px', 
                              color: '#fff',
                              '::placeholder': {
                                color: '#aaa'
                              },
                              iconColor: '#fff'
                            } 
                          } 
                        }} 
                      />
                    </div>
                    
                    <button type="submit" disabled={isSubmitting || loading} className={clsx(styles.card__payButton)}>
                      {isSubmitting || loading ? 'Обробка...' : 'Оплатити карткою'}
                    </button>
                    {message && <p className={clsx(styles.card__statusMessage)}>{message}</p>}
                  </div>
                </Form>
              )}
            </Formik>
          </section>
        </aside>

        {/* Модалка */}
        {isModalOpen && (
          <div className={clsx(styles.card__modalOverlay)} onClick={handleModalClose}>
            <div className={clsx(styles.card__modalContent)} onClick={(e) => e.stopPropagation()}>
              <div className={clsx(styles.card__qrWrapper)}>
                <img src={qrImage} alt="QR Code" className={clsx(styles.card__qrCode)} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className={clsx(styles.card__errorMessage)}>
            {error.message}
          </p>
        )}
      </article>
    </div>
  );
};

export default React.memo(EventCard);
