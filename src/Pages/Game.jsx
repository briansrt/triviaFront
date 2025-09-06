import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useSocket } from "../Context/SocketContext";
import Roulette from "../components/Game/Roulette";
import Question from "../components/Game/Question";

export default function Game() {
  const { roomCode } = useParams();
  const socket = useSocket();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const { user } = useUser();
  const [feedback, setFeedback] = useState(null); 
  const [category, setCategory] = useState(null);
  const userId = user.id;

  const [phase, setPhase] = useState("waiting"); // waiting | roulette | question | result

  const [question, setQuestion] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!socket || !socket.connected) return;

    console.log("🟢 Socket conectado:", socket.id); // DEBUG

    // 🚀 Escuchar cuando empieza la ronda de ruleta
    socket.on("startRoulette", (selectedCategory) => {
      console.log("🌀 Ruleta iniciada con categoría:", selectedCategory);
      setCategory(selectedCategory);
      setPhase("roulette")
    });

    // 🚀 Recibir una pregunta del backend
    socket.on("newQuestion", (q) => {
      setQuestion(q);
      setPhase("question");
    });

    // 🚀 Recibir resultado (correcto/incorrecto)
    socket.on("roundResult", (res) => {
      setResult(res);
      setPhase("result");
      setCategory(null);
      if (res.status === "eliminated") {
        setTimeout(() => navigate("/lobby"), 3000);
      }
    });

    // 🚀 Recibir ganador
    socket.on("gameWinner", (winner) => {
      setResult({ status: "winner", player: winner });
      setPhase("result");
      setTimeout(() => navigate("/lobby"), 5000);
    });

    socket.on("gameEnded", (msg) => {
      setResult({ status: "ended", message: msg.message });
      setPhase("result");
      setTimeout(() => navigate("/lobby"), 5000);
    });

    socket.on("roomUpdate", (room) => {
      setPlayers(room.players);
    });


    return () => {
      socket.off("startRoulette");
      socket.off("categoryChosen");
      socket.off("newQuestion");
      socket.off("roundResult");
      socket.off("gameWinner");
      socket.off("gameEnded");
      socket.off("roomUpdate");
    };
  }, [socket, navigate]);

  // 👉 El frontend dispara la ruleta cuando toca
  const handleRouletteFinish = (selectedCategory) => {
    socket.emit("rouletteFinished", { roomCode: roomCode, category: selectedCategory });
  };

  const handleAnswer = (answer) => {
    const isCorrect = answer === question.correctAnswer;
    setFeedback({ correct: isCorrect });
    setPhase("feedback");
    setTimeout(() => {
      socket.emit("answerQuestion", { roomCode: roomCode, answer, userId, name: user.firstName || user.username });
      setFeedback(null);
    }, 2000);
  };

  return (
  <div className="p-6 min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-blue-50 to-purple-100">
    <h1 className="text-3xl font-bold mb-8 text-blue-800 text-center">
      🎮 Partida en sala <span className="text-purple-600">{roomCode}</span>
    </h1>

    {players.length > 0 && (
      <div className="w-full max-w-md mb-6 bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2 text-gray-800">👥 Jugadores:</h2>
        <ul className="space-y-1">
          {players.map((player) => (
            <li
              key={player.userId}
              className={`text-base ${
                player.status === "eliminated" ? "text-red-500 line-through" : "text-gray-800"
              }`}
            >
              {player.name}
            </li>
          ))}
        </ul>
      </div>
    )}


    {phase === "waiting" && (
      <p className="text-lg text-gray-700 animate-pulse">
        ⏳ Esperando a que inicie la ronda...
      </p>
    )}

    {phase === "roulette" && category && (
      <div className="w-full max-w-xl">
        <Roulette key={category} selectedCategory={category} onFinish={handleRouletteFinish} />
      </div>
    )}

    {phase === "question" && question && (
      <div className="w-full max-w-xl">
        <Question question={question} onAnswer={handleAnswer} />
      </div>
    )}

    {phase === "feedback" && feedback && (
      <div className="text-center mt-10 p-6 bg-white rounded-lg shadow-md max-w-md w-full">
        {feedback.correct ? (
          <p className="text-green-600 text-xl font-semibold">
            ✅ ¡Respuesta correcta!
          </p>
        ) : (
          <p className="text-red-600 text-xl font-semibold">
            ❌ Respuesta incorrecta
          </p>
        )}
      </div>
    )}

    {phase === "result" && result && (
      <div className="text-center mt-10 p-6 bg-white rounded-lg shadow-md max-w-md w-full">
        {result.status === "correct" && (
          <p className="text-green-600 text-xl font-semibold">
            ✅ ¡Respuesta correcta!
          </p>
        )}
        {result.status === "eliminated" && (
          <p className="text-red-600 text-xl font-semibold">
            ❌ ¡Has sido eliminado!
          </p>
        )}
        {result.status === "ended" && (
          <p className="text-gray-700 text-xl font-semibold">
            ⚠️ Juego terminado: <br />
            <span className="text-gray-500 text-base">{result.message}</span>
          </p>
        )}
        {result.status === "winner" && (
          <p className="text-blue-700 text-xl font-semibold">
            🏆 Ganador: {result.player.name}
          </p>
        )}
      </div>
    )}
  </div>
);

}
