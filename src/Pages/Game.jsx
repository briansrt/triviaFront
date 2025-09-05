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
  const { user } = useUser();
  const userId = user.id;

  const [players, setPlayers] = useState([]);
  const [phase, setPhase] = useState("waiting"); // waiting | roulette | question | result
  const [category, setCategory] = useState(null);
  const [question, setQuestion] = useState(null);
  const [result, setResult] = useState(null);

  // 🔁 Pedir el estado actual al entrar
  useEffect(() => {
    if (!socket) return;

    const handleRoomState = ({ phase, category, question }) => {
      console.log("🔄 Estado actual recibido:", { phase, category, question });
      setPhase(phase);
      if (category) setCategory(category);
      if (question) setQuestion(question);
    };

    socket.emit("getRoomState", { roomCode });
    socket.on("roomState", handleRoomState);

    return () => {
      socket.off("roomState", handleRoomState);
    };
  }, [socket, roomCode]);

  // 🧠 Registrar todos los eventos del juego
  useEffect(() => {
    if (!socket) return;

    const setupListeners = () => {
      console.log("🟢 Socket conectado:", socket.id);

      socket.on("startRoulette", (selectedCategory) => {
        console.log("🌀 Ruleta iniciada con categoría:", selectedCategory);
        setCategory(selectedCategory);
        setPhase("roulette");
      });

      socket.on("newQuestion", (q) => {
        console.log("📩 Nueva pregunta recibida:", q);
        setQuestion(q);
        setPhase("question");
      });

      socket.on("roundResult", (res) => {
        console.log("📊 Resultado de ronda:", res);
        setResult(res);
        setPhase("result");
        setCategory(null);
        if (res.status === "eliminated") {
          setTimeout(() => navigate("/lobby"), 3000);
        }
      });

      socket.on("gameWinner", (winner) => {
        console.log("🏆 Ganador del juego:", winner);
        setResult({ status: "winner", player: winner });
        setPhase("result");
        setTimeout(() => navigate("/lobby"), 5000);
      });

      socket.on("gameEnded", (msg) => {
        console.log("🛑 Juego terminado:", msg.message);
        setResult({ status: "ended", message: msg.message });
        setPhase("result");
        setTimeout(() => navigate("/lobby"), 5000);
      });

      socket.on("roomUpdate", (room) => {
        setPlayers(room.players);
      });
    };

    if (socket.connected) {
      setupListeners();
    } else {
      socket.on("connect", setupListeners);
    }

    return () => {
      socket.off("connect", setupListeners);
      socket.off("startRoulette");
      socket.off("newQuestion");
      socket.off("roundResult");
      socket.off("gameWinner");
      socket.off("gameEnded");
      socket.off("roomUpdate");
    };
  }, [socket, navigate]);

  const handleRouletteFinish = (selectedCategory) => {
    socket.emit("rouletteFinished", { roomCode, category: selectedCategory });
  };

  const handleAnswer = (answer) => {
    socket.emit("answerQuestion", {
      roomCode,
      answer,
      userId,
      name: user.firstName || user.username,
    });
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
          {result.status === "timeout" && (
            <p className="text-orange-600 text-xl font-semibold">
              ⏱️ ¡Se acabó el tiempo! Eliminado.
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
