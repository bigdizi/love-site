import React, { useState, useEffect, useRef } from "react";
import emailjs from '@emailjs/browser';
import Confetti from 'react-confetti';
import "./App.css";

// Хук для звуковых эффектов
const useSound = (src, volume = 0.7) => {
  const sound = useRef(new Audio(src));
  sound.current.volume = volume;
  
  const play = () => {
    sound.current.currentTime = 0;
    sound.current.play().catch(e => console.log("Audio error:", e));
  };
  
  return play;
};

// Компонент для тестовой игры
const QuizGame = ({ questions, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const playCorrect = useSound('/correct.ogg');
  const playWrong = useSound('/wrong.ogg');
  const playComplete = useSound('/level-complete.ogg');

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    if (answer === questions[currentQuestion].correctAnswer) {
      setScore(score + 10);
      playCorrect();
    } else {
      playWrong();
    }
    setShowResult(true);
    
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setShowResult(false);
        setSelectedAnswer(null);
      } else {
        playComplete();
        onComplete(score);
      }
    }, 1500);
  };

  return (
    <div style={styles.gameContainer}>
      <h3 style={styles.gameTitle}>Тест о нас</h3>
      <div style={styles.questionContainer}>
        <p style={styles.questionText}>{questions[currentQuestion].question}</p>
        <div style={styles.optionsContainer}>
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={showResult}
              style={{
                ...styles.optionButton,
                ...(selectedAnswer === index ? styles.selectedOption : {}),
                ...(showResult && index === questions[currentQuestion].correctAnswer ? styles.correctOption : {})
              }}
            >
              {option}
            </button>
          ))}
        </div>
        {showResult && (
          <p style={styles.resultText}>
            {selectedAnswer === questions[currentQuestion].correctAnswer
              ? 'Молодец Жаным! +10 очков'
              : `Ничего страшного зай! Правильный ответ: ${questions[currentQuestion].options[questions[currentQuestion].correctAnswer]}`}
          </p>
        )}
      </div>
      <div style={styles.progressText}>
        Вопрос {currentQuestion + 1} из {questions.length}
      </div>
    </div>
  );
};

// Компонент для угадывания даты
const DateGuessGame = ({ photos, onComplete }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [userDates, setUserDates] = useState(Array(photos.length).fill(null));
  const [score, setScore] = useState(0);
  
  const playGood = useSound('/correct.ogg');
  const playBad = useSound('/wrong.ogg');
  const playComplete = useSound('/level-complete.ogg');

  const handleDateSubmit = (date) => {
    const newUserDates = [...userDates];
    newUserDates[currentPhotoIndex] = date;
    setUserDates(newUserDates);
    
    const diffDays = Math.abs(
      (new Date(date) - new Date(photos[currentPhotoIndex].correctDate)) / (1000 * 60 * 60 * 24));
    const points = Math.max(0, 10 - Math.floor(diffDays));
    setScore(score + points);
    
    if (points >= 8) playGood();
    else playBad();
    
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    } else {
      playComplete();
      onComplete(score);
    }
  };

  return (
    <div style={styles.gameContainer}>
      <h3 style={styles.gameTitle}>Угадай дату</h3>
      <img 
        src={photos[currentPhotoIndex].image} 
        alt="Наше воспоминание" 
        style={styles.memoryPhoto}
      />
      <p style={styles.questionText}>Когда было сделано это фото?</p>
      <input
        type="date"
        onChange={(e) => handleDateSubmit(e.target.value)}
        value={userDates[currentPhotoIndex] || ''}
        style={styles.dateInput}
      />
      <div style={styles.progressText}>
        Фото {currentPhotoIndex + 1} из {photos.length}
      </div>
    </div>
  );
};

// Компонент для паззла
const PuzzleGame = ({ image, onComplete }) => {
  const [level, setLevel] = useState(1);
  const [pieces, setPieces] = useState([]);
  const [board, setBoard] = useState([]);
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [showOriginal, setShowOriginal] = useState(false);
  
  const playDrop = useSound('/piece-drop.mp3');
  const playComplete = useSound('/level-complete.ogg');
  const playWin = useSound('/game-complete.mp3');

  const levelImages = {
    1: image,       // Первый уровень - переданное изображение (photo1.jpg)
    2: "/photo27.jpg", // Второй уровень
    3: "/photo19.jpg"  // Третий уровень
  };
  
  const currentImage = levelImages[level];

  useEffect(() => {
    const pieceCount = level === 1 ? 12 : level === 2 ? 24 : 36;
    const cols = level === 1 ? 4 : level === 2 ? 6 : 6;
    const rows = Math.ceil(pieceCount / cols);
    
    const newPieces = Array.from({ length: pieceCount }, (_, i) => ({
      id: i,
      src: currentImage,
      position: { 
        x: (i % cols) * (100 / cols) * 6, 
        y: Math.floor(i / cols) * (100 / rows) * 4
      },
      boardPosition: null
    }));
    
    setPieces(shuffleArray([...newPieces]));
    setBoard(Array(pieceCount).fill(null));
  }, [level, currentImage]);

  const handleDragStart = (e, piece) => {
    setDraggedPiece(piece);
    e.dataTransfer.setData('text/plain', piece.id);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedPiece && !board[index]) {
      playDrop();
      
      const newBoard = [...board];
      newBoard[index] = draggedPiece;
      setBoard(newBoard);
      
      const newPieces = pieces.filter(p => p.id !== draggedPiece.id);
      setPieces(newPieces);
      
      setDraggedPiece(null);
      
      if (newPieces.length === 0 && !newBoard.includes(null)) {
        setTimeout(() => {
          if (level < 3) {
            playComplete();
            setLevel(level + 1);
          } else {
            playWin();
            onComplete();
          }
        }, 1000);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div style={styles.puzzleContainer}>
      <h3 style={styles.gameTitle}>Собери наше фото (Уровень {level})</h3>
      
      {/* Кнопка показа оригинала */}
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={() => setShowOriginal(true)}
          style={styles.previewButton}
        >
          Показать оригинал
        </button>
      </div>
      
      {/* Модальное окно с оригиналом */}
      {showOriginal && (
        <div style={styles.modalOverlay} onClick={() => setShowOriginal(false)}>
          <div style={styles.modalContent}>
            <img 
              src={currentImage} 
              alt="Оригинал" 
              style={{ maxWidth: '100%', maxHeight: '80vh' }}
            />
            <p style={{ marginTop: '10px' }}>Закрой, чтобы продолжить</p>
          </div>
        </div>
      )}
      
      <div style={styles.puzzleArea}>
        <div style={{
          ...styles.puzzleBoard,
          gridTemplateColumns: `repeat(${level === 1 ? 4 : level === 2 ? 6 : 6}, 100px)`
        }}>
          {board.map((piece, index) => (
            <div 
              key={`board-${index}`}
              style={styles.boardCell}
              onDrop={(e) => handleDrop(e, index)}
              onDragOver={handleDragOver}
            >
              {piece && (
                <div 
                  style={{
                    ...styles.puzzlePiece,
                    backgroundImage: `url(${piece.src})`,
                    backgroundPosition: `-${piece.position.x}px -${piece.position.y}px`,
                    backgroundSize: `${level === 1 ? 400 : level === 2 ? 600 : 600}px auto`
                  }}
                />
              )}
            </div>
          ))}
        </div>
        
        <div style={styles.piecesContainer}>
          {pieces.map(piece => (
            <div
              key={piece.id}
              draggable
              onDragStart={(e) => handleDragStart(e, piece)}
              style={{
                ...styles.puzzlePiece,
                backgroundImage: `url(${piece.src})`,
                backgroundPosition: `-${piece.position.x}px -${piece.position.y}px`,
                backgroundSize: `${level === 1 ? 400 : level === 2 ? 600 : 600}px auto`,
                cursor: 'grab'
              }}
            />
          ))}
        </div>
      </div>
      
      <button 
        onClick={() => level < 3 ? setLevel(level + 1) : onComplete()}
        style={styles.skipButton}
      >
        {level < 3 ? 'Следующий уровень' : 'Завершить игру'}
      </button>
    </div>
  );
};

// Главный компонент игры
const GamePage = () => {
  const [gameStage, setGameStage] = useState('quiz');
  const [totalScore, setTotalScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  
  const playStart = useSound('/game-start.mp3');
  const playFinish = useSound('/game-complete.mp3');

  useEffect(() => {
    playStart();
  }, []);

  // Данные для теста
  const quizQuestions = [
    {
      question: "Какая была дата нашего первого поцелуя?",
      options: ["6 апреля", "17 апреля", "15 апреля", "24 апреля"],
      correctAnswer: 1 // 17 апреля
    },
    {
      question: "Моя любимая часть твоего тела?",
      options: ["Носик", "Губы", "Животик", "Руки"],
      correctAnswer: 2 // Животик
    },
    {
      question: "Мое любимое блюдо и напиток?",
      options: ["Паста и Капучино", "Манты и Чай с молоком", "Беш и Шорпа", "Плов и Кола"],
      correctAnswer: 1 // Манты и Чай с молоком
    }
  ];

  // Фиксированные фото с датами
  const memoryPhotos = [
    { image: "/photo32.jpg", correctDate: "2025-01-14" }, // 14 января 2025
    { image: "/photo10.jpg", correctDate: "2024-06-28" }, // 28 июня 2024
    { image: "/photo38.jpg", correctDate: "2025-04-15" }  // 15 апреля 2025
  ];

  // Фиксированное изображение для паззла
  const puzzleImage = "/photo1.jpg";

  const handleQuizComplete = (score) => {
    setTotalScore(score);
    setGameStage('date-guess');
  };

  const handleDateGuessComplete = (score) => {
    setTotalScore(totalScore + score);
    setGameStage('puzzle');
  };

  const handlePuzzleComplete = () => {
    playFinish();
    setTotalScore(totalScore + 50);
    setGameCompleted(true);
  };

  return (
    <div style={styles.pageContainer}>
      <h2 style={styles.mainTitle}>Наша интерактивная игра</h2>
      
      {!gameCompleted ? (
        <>
          {gameStage === 'quiz' && (
            <QuizGame questions={quizQuestions} onComplete={handleQuizComplete} />
          )}
          {gameStage === 'date-guess' && (
            <DateGuessGame photos={memoryPhotos} onComplete={handleDateGuessComplete} />
          )}
          {gameStage === 'puzzle' && (
        <PuzzleGame 
          image="/photo1.jpg" // Первый уровень
          onComplete={handlePuzzleComplete} 
        />
      )}
        </>
      ) : (
        <div style={styles.resultsContainer}>
          <Confetti width={window.innerWidth} height={window.innerHeight} />
          <h3 style={styles.congratsTitle}>Игра завершена!</h3>
          <p style={styles.scoreText}>Твой результат: {totalScore} очков</p>
          <p style={styles.thanksText}>Спасибо, что играла! Это было весело!</p>
        </div>
      )}
    </div>
  );
};

function App() {
  const photos = Array.from({length: 40}, (_, i) => `/photo${i+1}.jpg`);
  const videos = Array.from({length: 8}, (_, i) => `/video${i+1}.MOV`);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoIndex, setVideoIndex] = useState(0);
  const [isDay, setIsDay] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const startDate = new Date("2024-04-24T00:00:00");

  const [timeElapsed, setTimeElapsed] = useState({
    years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0,
  });

  const [currentPage, setCurrentPage] = useState("gallery");
  const [formData, setFormData] = useState({ name: "", email: "", message: "", openDate: "" });
  const [promoData, setPromoData] = useState({ name: "", email: "", promocode: "" });
  const [messageSent, setMessageSent] = useState(false);
  const [promoSent, setPromoSent] = useState(false);
  const [language, setLanguage] = useState('russian'); // Добавь эту строку

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("/lovesong.mp3");
    audioRef.current.loop = true;
    
    // Попробуйте явно вызвать play
    audioRef.current.play()
      .catch(err => console.error('Ошибка воспроизведения музыки: ', err));
  
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  

  // Time calculation effect
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = now - startDate;
      const years = now.getFullYear() - startDate.getFullYear();
      const months = (years * 12 + now.getMonth() - startDate.getMonth()) - 
        (now.getDate() < startDate.getDate() ? 1 : 0);
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
  const handlePrevVideo = () => setVideoIndex((prev) => (prev - 1 + videos.length) % videos.length);
  const handleNextVideo = () => setVideoIndex((prev) => (prev + 1) % videos.length);

  const toggleTheme = () => setIsDay(!isDay);
  
  const toggleMusic = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play()
        .catch(error => console.log("Audio play failed:", error));
    }
    setIsPlaying(!isPlaying);
  };

  const poem = (
    <p style={styles.poem}>
      Этот сайт я создал для тебя, чтобы ты всегда могла видеть, сколько времени мы вместе. <br />
      Целый год прошёл с того самого дня, и за это время я понял, что ты — моя судьба. <br />
      Моя любовь к тебе — чиста и прозрачна, как капля росы. <br />
      Я исполню каждую твою мечту, потому что ты — моя мечта. <br />
      Мы скоро отправимся в США, штат Огайо, по программе Work and Travel — <br />
      это будет наше новое незабываемое приключение. 💼✈️🇺🇸 <br />
    </p>
  );

  return (
    <div style={{
      ...styles.container,
      backgroundColor: isDay ? "#fff0f5" : "#1a1a2e",
      color: isDay ? "#000" : "#fff",
    }}>
      <div style={styles.menuContainer}>
        <div style={styles.menu}>
          <button 
            onClick={() => setCurrentPage("gallery")} 
            style={{...styles.menuButton, backgroundColor: currentPage === "gallery" ? "#e75480" : "#ff85c1"}}
          >
            Галерея
          </button>
          <button 
            onClick={() => setCurrentPage("video")} 
            style={{...styles.menuButton, backgroundColor: currentPage === "video" ? "#e75480" : "#ff85c1"}}
          >
            Видео
          </button>
          <button 
            onClick={() => setCurrentPage("timer")} 
            style={{...styles.menuButton, backgroundColor: currentPage === "timer" ? "#e75480" : "#ff85c1"}}
          >
            Таймер
          </button>
          <button 
            onClick={() => setCurrentPage("dreams")} 
            style={{...styles.menuButton, backgroundColor: currentPage === "dreams" ? "#e75480" : "#ff85c1"}}
          >
            Мечты
          </button>
        </div>
        <div style={styles.menu}>
          <button 
            onClick={() => setCurrentPage("promo")} 
            style={{...styles.menuButton, backgroundColor: currentPage === "promo" ? "#e75480" : "#ff85c1"}}
          >
            🎁 Промокод
          </button>
          <button 
            onClick={() => setCurrentPage("futureLetter")} 
            style={{...styles.menuButton, backgroundColor: currentPage === "futureLetter" ? "#e75480" : "#ff85c1"}}
          >
            📬 Письмо
          </button>
          <button 
            onClick={() => setCurrentPage("game")} 
            style={{...styles.menuButton, backgroundColor: currentPage === "game" ? "#e75480" : "#ff85c1"}}
          >
            🎮 Игра
          </button>
          <button 
            onClick={toggleTheme} 
            style={styles.menuButton}
          >
            {isDay ? "🌙 Aiym": "☀️ Kunim"}
          </button>
          <button 
            onClick={toggleMusic} 
            style={styles.menuButton}
          >
            {isPlaying ? "⏸ Музыка" : "▶️ Музыка"}
          </button>
        </div>
      </div>

      {/* Галерея */}
      {currentPage === "gallery" && (
        <div style={styles.contentContainer}>
          <h1 style={{ ...styles.title, color: isDay ? "#c71585" : "#ff85c1" }}>💖 Годовщина любви 💖</h1>
          {poem}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
           <button 
              onClick={() => setLanguage('russian')}
             style={{ 
        padding: '5px 15px',
        background: language === 'russian' ? '#ff85c1' : '#f0f0f0',
        color: language === 'russian' ? 'white' : '#333',
        border: 'none',
        borderRadius: '5px'
      }}
    >
      Русский
    </button>
    <button 
      onClick={() => setLanguage('kazakh')}
      style={{ 
        padding: '5px 15px',
        background: language === 'kazakh' ? '#00afca' : '#f0f0f0',
        color: language === 'kazakh' ? 'white' : '#333',
        border: 'none',
        borderRadius: '5px'
      }}
    >
      Қазақша
    </button>
    <button 
      onClick={() => setLanguage('english')}
      style={{ 
        padding: '5px 15px',
        background: language === 'english' ? '#012169' : '#f0f0f0',
        color: language === 'english' ? 'white' : '#333',
        border: 'none',
        borderRadius: '5px'
      }}
    >
      English
    </button>
  </div>

  {/* Мультиязычные стихи (замени {poem} на это) */}
  {language === 'russian' && (
    <p style={styles.poem}>
      Этот стих я написал для тебя, чтобы ты всегда могла видеть, Как я тебя люблю... <br />
      <br />
        Ты — как запах у шеи,<br />
        Шлейф аромата вдыхаю,<br />
        Ты — как мочка ушей,<br />
        Мягка и гладка, я таю<br />
        <br />
Ты — как тортик ванильный,<br />
Моя сладость и слабость,<br />
Но с тобою я сильный,<br />
Моя гордость и радость.<br />
<br />
Ты — моя айналайын и жаным,<br />
Мой цветок вечной любви,<br />
Поливаю утром я ранним,<br />
И вот уже я в пути.<br />
<br />
Иду куда глаза глядят,<br />
А глядят они на тебя... <br />
Ты — моё вдохновение,<br />
Нежно-нежно светя<br />
<br />
И пусть время летит,<br />
Но с тобой — оно будто замедлено,<br />
Ведь ты — мой магнит,<br />
И любовь моя к тебе — вневременна.<br />
<br />
Я не певец, жаным, не M'dee,<br />
Но чтобы чувства донести,<br />
Создал сайт для тебя,<br />
Делал по ночам и любя,<br />
Жаль, что не песня, прости<br />
<br />
Чтобы описать мою к тебе любовь<br />
Не хватит гига-терабайтов,<br />
Хочу сказать тебе вновь,<br />
Не хватит даже и сайтов<br />
<br />
Эмоции, вот индикатор лучше,<br />
На мою улыбку при тебе посмотри,<br />
Ты - как рай для моей души,<br />
Своей легкой весною ее обостри<br />
<br />
Я не певец, но душой композитор,<br />
Пишу тебе стихи из тихих восторгов,<br />
Мой ритм — это взгляд, где ты — мотив,<br />
Создал все для тебя, сердце расстрогав <br />
<br />
Я за год так вырос рядом с тобой,<br />
Научился быть самим собой,<br />
Защитив тебя, готов я на бой,<br />
А сняв доспехи, я твой милый boy<br />
<br />
Мы летим в США уже этим летом,<br />
И наша песенька еще не спета,<br />
Не удивить тебя комплиментом,<br />
Хоть ты мой яркий лучик света<br />
<br />
Ты — как утро в апреле,<br />
Капелькой солнца в чашечке дня,<br />
Ты — шепот в метели,<br />
Что греет, только и только меня.<br />
<br />
Ты — как страница блокнота,<br />
Где каждая буква — любовь,<br />
Ты — ноты в мелодии Мота,<br />
Без них моя жизнь — молчанье вновь.<br />
<br />
Ты — мой первый и последний вздох,<br />
Мой компас в океане снов,<br />
Ты — тихий свет сказал мне Бог,<br />
Где нет ни туч, ни облаков.<br />
<br />
Я не поэт, но сердце рвется,<br />
Чтоб рассказать, как ты прекрасна,<br />
Как без тебя мне не смеется,<br />
Ведь иногда ты опасна.<br />
<br />
Мы с тобой — как две строки,<br />
Что сплелись в одном стихе,<br />
Как весна и две сороки,<br />
Как волна и смех в песке.<br />
<br />
Пусть года бегут, как реки,<br />
Наш огонь не угасай,<br />
Ты — моя навеки,<br />
Я — твой, ты это знай.<br />
    </p>
  )}
  {language === 'kazakh' && (
    <p style={styles.poem}>
      Бұл сайтты мен сен үшін жасадым, өйткені сен менің өмірімнің жарығысың... <br />
      Сен менің көктемімсің, таңғы шықтай,<br/>
Жанымның гүлденген бақтай бір жай.<br/>
Қараймын көздеріңе — үнсіз ғана,<br/>
Тыңдаймын жүректің сырлы мұңын ай.<br/>
<br/>
Сен менің сағымымсың — ұшқан бұлттай,<br/>
Қиялдың биігіне алып ұшпай.<br/>
Күлкіңмен күн ашылып тұрады үнемі,<br/>
Сен барда, өмірім — жырмен тұнған.<br/>
<br/>
Сен менің жанымдағы тыныштықсың,<br/>
Аласапыран ойдан құтқарған күшсің.<br/>
Әр күні өзіңмен гүлдеп басталып,<br/>
Кештері — тәтті түс, жарық түнсің.<br/>
<br/>
Сен менің ең жылы шақтарымсың,<br/>
Көңілімнің нұрлы бақтарымсың.<br/>
Мәңгілік махаббат тілейтін болсам,<br/>
Сол тілек — сен болар, жан сырымсың.<br/>

    </p>
  )}
  {language === 'english' && (
  <p style={styles.poem}>
    {`
I created this website for you to celebrate our love...

You are the hush of the moon at night,
The whisper that turns dark into light.
You are the silence that sings so loud,
A gentle heart lost in the crowd.

You're the echo my soul replies to,
The reason the sky is painted in blue.
You're not just a part — you're the whole,
The melody stitched to the seams of my soul.

You’re the warmth when the world turns cold,
The story my every breath has told.
In your arms, I forget the race,
Find heaven framed within your face.

You are my calm, my sacred space,
My prayer in motion, my endless grace.
With you, forever feels just right,
Like stars that fall just to shine each night.

You’re my poem, my pause, my song,
The place where all my dreams belong.
A soft hello, a lingering stay —
You’re the love I’ll never outgrow, come what may.

Her name is Nuray — like a whisper of light,
In the silence of night, she makes my world bright.
From the peaks of Almaty, under stars we lay,
Counting dreams, one step from the USA.

Only one month 'til we chase that dream,
Across oceans and skies, like a silver stream.
You're the art in my life, the stroke in my fate,
The love that arrived, never too late.

You draw with your heart, and it shows in your eyes,
Each glance, a soft sketch of our endless skies.
You're sweet like the dishes you always adore,
But it’s you, my Nuray, that I’ll always want more.

You shine without trying, no filter, no gloss,
In my life, you're the gain, never the loss.
You're my muse, my rhythm, my beat,
The reason my every verse feels complete.

No rhyme could capture your delicate grace,
But I’ll keep trying, to trace your face
In melodies and lines, in notes that soar —
Because you’re my today, my forevermore.
    `.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}<br />
      </React.Fragment>
    ))}
  </p>
)}

<div style={styles.mediaContainer}>
  <img src={photos[currentIndex]} alt="Наша галерея" style={styles.image} />
</div>
<div style={styles.navigationButtons}>
  <button onClick={handlePrev} style={styles.navButton}>←</button>
  <button onClick={handleNext} style={styles.navButton}>→</button>
</div>

</div>
      )}

      {/* Видео */}
      {currentPage === "video" && (
        <div style={styles.contentContainer}>
          <h1 style={{ ...styles.title, color: isDay ? "#c71585" : "#ff85c1" }}>🎥 Наши видео 🎥</h1>
          {poem}
          <div style={styles.mediaContainer}>
            <video key={videoIndex} controls style={styles.video}>
              <source src={videos[videoIndex]} type="video/mp4" />
              Ваш браузер не поддерживает видео.
            </video>
          </div>
          <div style={styles.navigationButtons}>
            <button onClick={handlePrevVideo} style={styles.navButton}>←</button>
            <button onClick={handleNextVideo} style={styles.navButton}>→</button>
          </div>
        </div>
      )}

      {/* Таймер */}
      {currentPage === "timer" && (
        <div style={styles.contentContainer}>
          <h1 style={{ ...styles.title, color: isDay ? "#c71585" : "#ff85c1" }}>🕰 Таймер любви 🕰</h1>
          {poem}
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

      {/* Мечты */}
      {currentPage === "dreams" && (
        <div style={styles.contentContainer}>
          <h1 style={{ ...styles.title, color: isDay ? "#c71585" : "#ff85c1" }}>🌠 Наши мечты 🌠</h1>
          {poem}
          <h2 style={styles.subtitle}>✨ Карта желаний ✨</h2>
          <ul style={styles.wishList}>
            <li>🌍 Поехать в Америку (Ohio) и провести там лучшее лето </li>
            <li>🏡 Свой уютный дом к концу этого года </li>
            <li>🎓 Закончить наш университет удачно, аман-есен</li>
            <li>💍 Свадьба и уютная семья к 30 годам </li>
            <li>🐶 Завести пёсика</li>
            <li>🎨 Творить, быть свободными и путешествовать </li>
          </ul>
        </div>
      )}

      {/* Промокод */}
      {currentPage === "promo" && (
        <div style={styles.contentContainer}>
          <h1 style={{ ...styles.title, color: isDay ? "#c71585" : "#ff85c1" }}>🎁 Получить промокод 🎁</h1>
          {poem}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              emailjs.send("service_8ovpubb", "template_44l8ovp", {
                name: promoData.name,
                email: promoData.email,
                promocode: promoData.promocode,
              }, "6vYAmaisL7utSUuLe")
                .then(() => {
                  setPromoSent(true);
                  setPromoData({ name: "", email: "", promocode: "" });
                })
                .catch((err) => {
                  console.error("Failed to send promocode:", err);
                  alert("Произошла ошибка при отправке. Пожалуйста, попробуйте ещё раз.");
                });
            }}
            style={styles.form}
          >
            <input
              type="text"
              placeholder="Ваше имя"
              value={promoData.name}
              onChange={(e) => setPromoData({ ...promoData, name: e.target.value })}
              required
              style={styles.input}
            />
            <input
              type="email"
              placeholder="Ваш email"
              value={promoData.email}
              onChange={(e) => setPromoData({ ...promoData, email: e.target.value })}
              required
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Введите промокод"
              value={promoData.promocode}
              onChange={(e) => setPromoData({ ...promoData, promocode: e.target.value })}
              required
              style={styles.input}
            />
            <button type="submit" style={styles.submitButton}>
              Отправить промокод
            </button>
          </form>
          {promoSent && (
            <p style={styles.successMessage}>
              Ваш промокод успешно отправлен! Проверьте вашу почту.
            </p>
          )}
        </div>
      )}

      {/* Письмо в будущее */}
      {currentPage === "futureLetter" && (
        <div style={styles.contentContainer}>
          <h1 style={{ ...styles.title, color: isDay ? "#c71585" : "#ff85c1" }}>📬 Письмо в будущее 📬</h1>
          {poem}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              emailjs.send("service_8ovpubb", "template_44l8ovp", {
                name: formData.name,
                email: formData.email,
                message: formData.message,
                openDate: formData.openDate,
              }, "6vYAmaisL7utSUuLe")
                .then(() => {
                  setMessageSent(true);
                  setFormData({ name: "", email: "", message: "", openDate: "" });
                })
                .catch((err) => {
                  console.error("Failed to send letter:", err);
                  alert("Произошла ошибка при отправке. Пожалуйста, попробуйте ещё раз.");
                });
            }}
            style={styles.form}
          >
            <input
              type="text"
              placeholder="Ваше имя"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              style={styles.input}
            />
            <input
              type="email"
              placeholder="Ваш email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              style={styles.input}
            />
            <textarea
              placeholder="Напишите ваше письмо"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              style={styles.textarea}
            />
            <label style={styles.dateLabel}>Дата получения письма:</label>
            <input
              type="date"
              value={formData.openDate}
              onChange={(e) => setFormData({ ...formData, openDate: e.target.value })}
              required
              style={styles.input}
            />
            <button type="submit" style={styles.submitButton}>
              Отправить письмо
            </button>
          </form>
          {messageSent && (
            <p style={styles.successMessage}>
              Ваше письмо отправлено! Оно будет доставлено в выбранную дату.
            </p>
          )}
        </div>
      )}

      {/* Игра */}
      {currentPage === "game" && <GamePage />}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "100vh",
    padding: "20px",
    fontFamily: "'Arial', sans-serif",
    boxSizing: "border-box",
  },
  menuContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "30px",
    width: "100%",
    maxWidth: "800px",
  },
  menu: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  menuButton: {
    backgroundColor: "#ff85c1",
    color: "#fff",
    border: "none",
    padding: "10px 15px",
    cursor: "pointer",
    fontSize: "16px",
    borderRadius: "5px",
    transition: "all 0.3s ease",
    minWidth: "100px",
  },
  contentContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    maxWidth: "800px",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "20px",
  },
  mediaContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    margin: "20px 0",
  },
  image: {
    maxWidth: "100%",
    maxHeight: "70vh",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
  video: {
    maxWidth: "100%",
    maxHeight: "70vh",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
  navigationButtons: {
    display: "flex",
    gap: "20px",
    marginBottom: "20px",
  },
  navButton: {
    backgroundColor: "#ff85c1",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    fontSize: "1.2rem",
    borderRadius: "50%",
    cursor: "pointer",
    width: "50px",
    height: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  timer: {
    fontSize: "1.2rem",
    textAlign: "center",
    lineHeight: "1.8",
    margin: "10px 0",
  },
  poem: {
    fontSize: "1rem",
    lineHeight: "1.6",
    textAlign: "center",
    color: "##0f0e0f",
    marginBottom: "20px",
    maxWidth: "800px",
  },
  subtitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    textAlign: "center",
    margin: "20px 0",
    color: "#ff85c1",
  },
  wishList: {
    fontSize: "1.1rem",
    listStyleType: "none",
    padding: "0",
    textAlign: "center",
    lineHeight: "2",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    width: "100%",
    maxWidth: "500px",
    backgroundColor: "rgba(255, 133, 193, 0.1)",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  input: {
    padding: "12px 15px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    fontSize: "1rem",
    outline: "none",
    transition: "border 0.3s",
  },
  textarea: {
    padding: "12px 15px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    fontSize: "1rem",
    minHeight: "150px",
    resize: "vertical",
    outline: "none",
    transition: "border 0.3s",
  },
  dateLabel: {
    fontSize: "0.9rem",
    color: "#666",
  },
  submitButton: {
    backgroundColor: "#ff85c1",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    fontSize: "1rem",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s",
    marginTop: "10px",
  },
  successMessage: {
    color: "#4CAF50",
    textAlign: "center",
    marginTop: "20px",
    fontSize: "1.1rem",
  },
  // Стили для игровой страницы
  gameContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '15px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  gameTitle: {
    color: '#ff85c1',
    textAlign: 'center',
    marginBottom: '20px',
  },
  questionContainer: {
    marginBottom: '20px',
  },
  questionText: {
    fontSize: '1.2rem',
    marginBottom: '15px',
    textAlign: 'center',
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  optionButton: {
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#ffb6d9',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontSize: '1rem',
  },
  selectedOption: {
    transform: 'scale(1.02)',
    boxShadow: '0 0 5px rgba(0,0,0,0.2)',
  },
  correctOption: {
    backgroundColor: '#4CAF50',
    color: 'white',
  },
  resultText: {
    textAlign: 'center',
    marginTop: '15px',
    fontWeight: 'bold',
  },
  progressText: {
    textAlign: 'center',
    color: '#888',
    fontSize: '0.9rem',
  },
  memoryPhoto: {
    width: '100%',
    maxHeight: '300px',
    objectFit: 'contain',
    borderRadius: '10px',
    margin: '15px 0',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  },
  dateInput: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    width: '100%',
    maxWidth: '250px',
    margin: '0 auto',
    display: 'block',
  },
  puzzleContainer: {
    textAlign: 'center',
  },
  puzzleArea: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    margin: '20px 0',
    flexWrap: 'wrap',
  },
  puzzleBoard: {
    display: 'grid',
    gap: '2px',
    border: '2px solid #ff85c1',
    padding: '10px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 133, 193, 0.1)',
  },
  boardCell: {
    width: '100px',
    height: '100px',
    border: '1px dashed #ccc',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  piecesContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    width: '420px',
    justifyContent: 'center',
  },
  puzzlePiece: {
    width: '100px',
    height: '100px',
    border: '1px solid #ff85c1',
    borderRadius: '4px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  previewButton: {
    padding: '8px 16px',
    backgroundColor: '#ff85c1',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
  },
  skipButton: {
    padding: '10px 20px',
    backgroundColor: '#ff85c1',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '20px',
  },
  resultsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '30px',
    borderRadius: '15px',
    textAlign: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  congratsTitle: {
    color: '#ff85c1',
    fontSize: '1.5rem',
    marginBottom: '15px',
  },
  languageButton: {
    padding: '5px 15px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  scoreText: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  thanksText: {
    fontSize: '1.1rem',
  }
};
// Функция для перемешивания массива
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default App;



