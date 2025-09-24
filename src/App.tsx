import React from 'react';
import EventCard from './components/EventCard';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_12345YOURKEY'); // заміни на свій

const eventData = {
  title: 'Music Fest',
  subtitle: 'Найкращий фестиваль року',
  date: '2025-10-15',
  time: '19:00',
  location: 'Київ',
  address: 'Великий зал, Хрещатик 1',
  description: [
    'Запрошуємо на великий музичний фестиваль!',
    'Тут зберуться найпопулярніші виконавці.',
  ],
  organizerPhone: '+380 67 123 45 67',
  ticketPrice: 500,
  availableTickets: 50,
};

const App: React.FC = () => {
  return (
    <Elements stripe={stripePromise}>
      <EventCard event={eventData} />
    </Elements>
  );
};

export default App;
