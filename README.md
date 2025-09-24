# 🎟 EventCard – карточка события с оплатой

Компонент **EventCard** отображает информацию о событии и поддерживает оплату билетов через **Stripe**, **Apple Pay**, **Google Pay** и другие методы.

---

## 🚀 Возможности

- Отображение информации о событии (название, описание, дата, место).
- Поддержка изображения и подзаголовка.
- Контакты организатора.
- Контроль количества билетов с кнопками `+` и `–`.
- Поддержка **Stripe CardElement** для ввода данных карты.
- Альтернативные методы оплаты:
  - Apple Pay
  - Google Pay
  - Рассрочка
- Мобильная оплата через QR-код (модальное окно).
- Сообщения об успешной оплате или ошибках.

---

## ⚙️ Пропсы

```ts
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
```
