import React, { useState, useEffect, useRef } from "react";
import emailjs from '@emailjs/browser';
import "./App.css";

function App() {
  const photos = ["/photo1.jpg", "/photo2.jpg", "/photo3.jpg", "/photo4.jpg", "/photo5.jpg", "/photo6.jpg", "/photo7.jpg", "/photo8.jpg", 
    "/photo9.jpg", "/photo10.jpg", "/photo11.jpg", "/photo12.jpg", "/photo13.jpg", "/photo14.jpg", "/photo15.jpg", "/photo16.jpg", "/photo17.jpg"
    , "/photo18.jpg", "/photo19.jpg", "/photo20.jpg", "/photo21.jpg", "/photo22.jpg", "/photo23.jpg", "/photo24.jpg", "/photo25.jpg", "/photo26.jpg"
    , "/photo27.jpg", "/photo28.jpg", "/photo29.jpg", "/photo30.jpg", "/photo31.jpg", "/photo32.jpg", "/photo33.jpg", "/photo34.jpg", "/photo35.jpg"
    , "/photo36.jpg", "/photo37.jpg", "/photo38.jpg", "/photo39.jpg", "/photo40.jpg"];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDay, setIsDay] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const startDate = new Date("2024-04-24T00:00:00");

  const [timeElapsed, setTimeElapsed] = useState({
    years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0,
  });

  const [currentPage, setCurrentPage] = useState("gallery");
  const [formData, setFormData] = useState({ name: "", email: "", code: "" });
  const [messageSent, setMessageSent] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = now - startDate;
    
      const years = now.getFullYear() - startDate.getFullYear();
      const months = (years * 12 + now.getMonth() - startDate.getMonth()) -
        (now.getDate() < startDate.getDate() ? 1 : 0); // если день ещё не наступил, уменьшаем на 1
    
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor(diff / 1000);
    
      setTimeElapsed({ years, months, days, hours, minutes, seconds });
    }, 1000);
    

    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % photos.length);
  const toggleTheme = () => setIsDay(!isDay);
  const toggleMusic = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  return (
    <div style={{
      ...styles.container,
      backgroundColor: isDay ? "#fff0f5" : "#1a1a2e",
      color: isDay ? "#000" : "#fff",
    }}>
      <div style={styles.menu}>
        <button onClick={() => setCurrentPage("gallery")} style={styles.menuButton}>Галерея</button>
        <button onClick={() => setCurrentPage("timer")} style={styles.menuButton}>Таймер</button>
        <button onClick={() => setCurrentPage("dreams")} style={styles.menuButton}>Наши мечты</button>
        <button onClick={() => setCurrentPage("promo")} style={styles.menuButton}>🎁 Промокод</button>
      </div>

      {currentPage === "gallery" && (
        <div>
          <h1 style={{ ...styles.title, color: isDay ? "#c71585" : "#ff85c1" }}>💖 Годовщина любви 💖</h1>
          <img src={photos[currentIndex]} alt="Наша галерея" style={styles.image} />
          <div style={styles.buttonContainer}>
            <button onClick={handlePrev} style={styles.button}>← Назад</button>
            <button onClick={handleNext} style={styles.button}>Вперёд →</button>
            <button onClick={toggleTheme} style={styles.button}>{isDay ? "🌙 Aiym" : "☀️ Kunim"}</button>
            <button onClick={toggleMusic} style={styles.button}>{isPlaying ? "⏸ Пауза" : "▶️ Музыка"}</button>
          </div>
        </div>
      )}

      {currentPage === "timer" && (
        <div>
          <h1 style={{ ...styles.title, color: isDay ? "#c71585" : "#ff85c1" }}>🕰 Таймер любви 🕰</h1>
          <p style={styles.timer}>С 24.04.2024 прошло:</p>
          <p style={styles.timer}>
            {timeElapsed.years} год<br />
            {timeElapsed.months} месяцев<br />
            {timeElapsed.days} дней<br />
            {timeElapsed.hours} часов<br />
            {timeElapsed.minutes} минут<br />
            {timeElapsed.seconds} секунд
          </p>
        </div>
      )}

      {currentPage === "dreams" && (
        <div>
          <h1 style={{ ...styles.title, color: isDay ? "#c71585" : "#ff85c1" }}>🌠 Наши мечты 🌠</h1>
          <p style={styles.poem}>
            Этот сайт я создал для тебя, чтобы ты всегда могла видеть, сколько времени мы вместе. <br />
            Целый год прошёл с того самого дня, и за это время я понял, что ты — моя судьба. <br />
            Моя любовь к тебе — чиста и прозрачна, как капля росы. <br />
            Я исполню каждую твою мечту, потому что ты — моя мечта. <br />
            Мы скоро отправимся в США, штат Огайо, по программе Work and Travel — <br />
            это будет наше новое незабываемое приключение. 💼✈️🇺🇸 <br />
          </p>
          <h2 style={{ ...styles.subtitle }}>✨ Карта желаний ✨</h2>
          <ul style={styles.wishList}>
            <li>🌍 Поехать в Америку (Ohio)</li>
            <li>🏡 Свой уютный дом</li>
            <li>🎓 Поступить в университет мечты</li>
            <li>💍 Свадьба и большая семья</li>
            <li>🐶 Завести пёсика</li>
            <li>🎨 Творить и быть свободными</li>
          </ul>
        </div>
      )}

      {currentPage === "promo" && (
        <div>
          <h1 style={{ ...styles.title, color: isDay ? "#c71585" : "#ff85c1" }}>🎁 Получи подарок 🎁</h1>
          <p style={styles.poem}>Введи свои данные, и мы вышлем тебе сюрприз на почту! ✨</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              emailjs.send("service_8ovpubb", "template_44l8ovp", formData, "6vYAmaisL7utSUuLe")
                .then(() => setMessageSent(true))
                .catch((err) => console.error("Ошибка:", err));
            }}
            style={{ ...styles.poem, backgroundColor: "#ffe4ec" }}
          >
            <input
              type="text"
              placeholder="Имя"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              style={styles.input}
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Промокод"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
              style={styles.input}
            />
            <button type="submit" style={styles.button}>Отправить</button>
            {messageSent && <p style={{ marginTop: "10px", color: "green" }}>Письмо отправлено! 📩</p>}
          </form>
        </div>
      )}

      <p style={styles.poem}>
        Ты — как запах у шеи, <br />
        Шлейф аромата вдыхаю, <br />
        Ты — как мочка ушей, <br />
        Мягка и гладка, я таю. <br />
        <br />
        Ты — как тортик ванильный, <br />
        Моя сладость и слабость, <br />
        Но с тобою я сильный, <br />
        Моя гордость и радость. <br />
        <br />
        Ты — моя айналайын и жаным, <br />
        Цветок моей души и любви, <br />
        Поливаю утром я ранним, <br />
        И иду по пути, что с тобой мы нашли. <br />
        <br />
        Америка ждёт нас вдвоих, <br />
        Мы там исполнить мечты поспешим. <br />
        Я люблю тебя, Нурай, всей душой — <br />
        Чистой, как небо в рассветный режим. 💞
      </p>

      <p style={styles.signature}>С любовью, твой Диаз 🤍</p>

      <audio ref={audioRef} loop>
        <source src="/lovesong.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "30px 15px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "'Segoe UI', sans-serif",
    textAlign: "center",
  },
  title: { fontSize: "2rem", marginBottom: "20px" },
  subtitle: { fontSize: "1.5rem", marginTop: "30px" },
  image: {
    width: "90%", maxWidth: "300px", height: "auto",
    objectFit: "cover", borderRadius: "20px", marginBottom: "20px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  },
  buttonContainer: {
    display: "flex", gap: "10px", marginBottom: "30px",
    flexWrap: "wrap", justifyContent: "center",
  },
  button: {
    backgroundColor: "#c71585", color: "#fff",
    border: "none", padding: "10px 20px",
    borderRadius: "10px", cursor: "pointer",
    fontSize: "1rem", fontWeight: "bold",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
  },
  poem: {
    fontSize: "1rem", maxWidth: "90%", lineHeight: "1.8",
    backgroundColor: "#ffffffcc", padding: "20px",
    borderRadius: "16px", marginTop: "30px",
  },
  signature: {
    marginTop: "40px", fontStyle: "italic", color: "#8b008b",
  },
  timer: {
    fontSize: "1.2rem", marginTop: "10px",
    fontWeight: "bold", color: "#ff1493",
  },
  menu: {
    display: "flex", justifyContent: "center", gap: "15px",
    marginBottom: "25px", flexWrap: "wrap",
  },
  menuButton: {
    padding: "10px 16px", backgroundColor: "#ff85c1",
    color: "#fff", border: "none", borderRadius: "10px",
    cursor: "pointer", fontSize: "1rem",
  },
  wishList: {
    listStyle: "none", padding: 0, marginTop: "15px",
    fontSize: "1.1rem",
  },
  input: {
    padding: "10px", margin: "10px 0",
    width: "90%", maxWidth: "300px",
    borderRadius: "8px", border: "1px solid #ccc",
    fontSize: "1rem",
  },
};

export default App;

