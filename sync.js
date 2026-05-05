// ================================
// DESIGRAF REAL-TIME SYNC SERVER
// ================================

const { Server } = require("socket.io");

function initSync(server) {
  const io = new Server(server, {
    cors: {
      origin: "*"
    }
  });

  // =========================
  // CONNECTION
  // =========================
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // =====================
    // JOIN SURVEY ROOM
    // =====================
    socket.on("joinSurvey", (surveyId) => {
      socket.join(surveyId);
    });

    // =====================
    // NEW RESPONSE
    // =====================
    socket.on("newResponse", (data) => {
      const { surveyId, response } = data;

      // broadcast to all clients watching this survey
      io.to(surveyId).emit("responseUpdate", response);

      // update stats live
      io.to(surveyId).emit("statsUpdate", {
        surveyId,
        timestamp: Date.now()
      });
    });

    // =====================
    // SURVEY UPDATED
    // =====================
    socket.on("surveyUpdated", (survey) => {
      io.emit("surveyChanged", survey);
    });

    // =====================
    // DISCONNECT
    // =====================
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}

module.exports = initSync;