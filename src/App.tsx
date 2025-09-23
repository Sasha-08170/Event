// App.tsx
import React from 'react';
import EventCard from './components/EventCard';

const App: React.FC = () => {
  const myEvent = {
    title: 'Назва Події',
    subtitle: 'Підзаголовок Події',
    date: '14 Травня',
    time: '19:00',
    location: 'Місце Проведення',
    address: 'Вулиця, 1А',
    description: ['Це опис події...', 'Більше деталей тут...'],
    organizerPhone: '+380 50 123 4567',
    ticketPrice: 300,
    availableTickets: 12,
  };

  return (
    <div className="event-card-container">
      <EventCard event={myEvent} />;
    </div>
  );
};

export default App;
