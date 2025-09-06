import { useEffect, useState } from "react";

export default function Question({ question, onAnswer }) {
  const [timeLeft, setTimeLeft] = useState(question.timeLimit || 5);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null); // true / false

  // Temporizador
  useEffect(() => {
    if (timeLeft <= 0 || answered) return;
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, answered]);

  // Calcular porcentaje de tiempo
  const percentage = (timeLeft / question.timeLimit) * 100;

  const getBarColor = () => {
    if (percentage > 50) return "bg-green-500";
    if (percentage > 25) return "bg-yellow-400";
    return "bg-red-500";
  };

  // 👉 Cuando el usuario responde
  const handleAnswer = (selected) => {
    if (answered) return;

    const correct = selected === question.correctAnswer;
    setIsCorrect(correct);
    setAnswered(true);

    setTimeout(() => {
      onAnswer(selected); // Se envía al backend como siempre
    }, 500);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md">
      {/* Pregunta */}
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        {question.text}
      </h2>

      {/* Opciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {question.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt)}
            disabled={answered} // 👈 deshabilita tras responder
            className={`${
              answered && opt === question.correctAnswer
                ? "bg-green-200 text-green-800 font-bold"
                : "bg-blue-100 hover:bg-blue-200 text-blue-900"
            } font-semibold px-4 py-3 rounded-lg shadow transition-all duration-300 text-center`}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Barra de tiempo */}
      <div className="mb-2 text-sm text-gray-500 text-center">
        Tiempo restante: {timeLeft}s
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${getBarColor()}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      {/* Feedback visual */}
      {answered && (
        <div className="mt-4 text-lg font-semibold text-center">
          {isCorrect ? (
            <span className="text-green-600">✅ ¡Respuesta correcta!</span>
          ) : (
            <span className="text-red-600">❌ Respuesta incorrecta</span>
          )}
        </div>
      )}
    </div>
  );
}
