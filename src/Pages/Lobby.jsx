import { useEffect, useState } from "react";
import { UserButton, useUser } from "@clerk/clerk-react";
import { useSocket } from "../Context/SocketContext";
import { useNavigate } from "react-router-dom";

export default function Lobby() {
  const { user } = useUser();
  
  const socket = useSocket();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);

  // Escuchar lista de salas y actualizaciones
  useEffect(() => {
    if (!socket) return;

    socket.emit("getRooms");

    socket.on("roomList", (data) => setRooms(data));
    socket.on("roomUpdate", (room) => setCurrentRoom(room));
    socket.on("startGame", ({ roomCode }) => {
        navigate(`/game/${roomCode}`);
    });

    return () => {
      socket.off("roomList");
      socket.off("roomUpdate");
      socket.off("startGame");
    };
  }, [socket, navigate]);

  const handleCreateRoom = () => {
    socket.emit("createRoom", { userId: user.id, name: user.firstName || user.username, imageUrl: user.imageUrl });
  };

  const handleJoinRoom = (roomCode) => {
    socket.emit("joinRoom", { roomCode, userId: user.id, name: user.firstName || user.username, imageUrl: user.imageUrl });
    console.log("🧩 Emitiendo joinRoom");
  };

  const handleStartGame = () => {
    if (currentRoom) {
      navigate(`/game/${currentRoom.roomCode}`);
    }
  };

  return (
    <div className="text-black">
      <div className="aspect-video">
        <img src="/preguntados_lobby.webp" alt="" />
      </div>
      <div className="p-6">
        {!currentRoom ? (
          <>
          <div className="flex flex-col items-center">
            <button
              onClick={handleCreateRoom}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-4 mt-6"
            >
              Crear Sala
            </button>
          </div>

            <h2 className="text-xl mt-4 mb-8">Salas disponibles:</h2>
            {rooms.length > 0 ? (
              <ul className="">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rooms.map((room) => (
                    <div
                      key={room.roomCode}
                      className="bg-white shadow-md rounded-lg p-4 flex flex-col justify-between"
                    >
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          Sala <span className="text-blue-600">{room.roomCode}</span>
                        </h3>
                        <p className="text-sm mb-2 text-gray-500">
                          Jugadores ({room.players.length}/{room.maxPlayers || 5})
                        </p>

                        <div className="flex gap-3 flex-wrap">
                          {room.players.map((player, index) => (
                            <div key={index} className="flex flex-col items-center w-16">
                              <img
                                src={player.imageUrl || "/default-avatar.png"}
                                alt={player.name}
                                className="w-12 h-12 rounded-full border border-gray-300"
                              />
                              <span className="text-xs mt-1 text-center break-words">
                                {player.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleJoinRoom(room.roomCode)}
                        className="bg-green-500 text-white px-4 py-1 rounded mt-4 hover:bg-green-600"
                      >
                        Unirse
                      </button>
                    </div>
                  ))}
                </div>

              </ul>
            ) : (
              <p>No hay salas disponibles.</p>
            )}
          </>
        ) : (
          <div className= "flex flex-col justify-center align-center items-center">
            <h2 className="text-xl mb-8">Sala {currentRoom.roomCode}</h2>
            <p className="mb-4">Jugadores:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
              {currentRoom.players.map((p) => (
                <div
                  key={p.userId}
                  className="flex flex-col items-center bg-white shadow-md rounded-lg p-4"
                >
                  <img
                    src={p.imageUrl || "/default-avatar.png"}
                    alt={p.name}
                    className="w-16 h-16 rounded-full border border-gray-300"
                  />
                  <p className="mt-2 text-sm font-medium text-gray-800 text-center break-words">
                    {p.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 capitalize">
                    {p.status === "alive" ? "Listo" : p.status}
                  </p>
                </div>
              ))}
            </div>


            {currentRoom.players.length === 6 && (
              <button
                onClick={handleStartGame}
                className="bg-red-500 text-white px-4 py-2 rounded-lg mt-4"
              >
                Iniciar Juego
              </button>
            )}
          </div>
        )}

      </div>
      <UserButton/>
    </div>
  );
}
